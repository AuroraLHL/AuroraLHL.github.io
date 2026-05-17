---
layout: post
title: "OPD: Mathematical Foundations"
date: 2026-05-17 00:00 +0800
categories: [AI, Large Language Models]
tags: [OPD, Distillation, KL, JSD]
math: true
---

本文主要讨论 `Forward KL`、`Reverse KL` 和 `Jensen-Shannon Divergence (JSD)` 这三个散度的数学形式，以及它们在`On-Policy Distillation`中为什么会带来不同的训练偏好。[^jsd]

# 1. Forward KL / Reverse KL / JSD

为了先把三个散度本身讲清楚，这一节暂时固定某一个预测位置，也就是固定一个当前前缀状态 $s$。在这个状态下，teacher 和 student 各自都会给出一个关于下一个 token / action 的条件分布。这里统一一下记号：

- $P_t(a\mid s)$ 表示 teacher 在状态 $s$ 下选择 token / action $a$ 的概率；
- $P_s(a\mid s)$ 表示 student 在状态 $s$ 下选择 token / action $a$ 的概率；
- $P_m(a\mid s)=\frac{1}{2}\left(P_t(a\mid s)+P_s(a\mid s)\right)$ 表示 teacher 和 student 的混合分布；
- $a$ 可以理解成一个 token / action；
- $s$ 可以理解成当前 prompt prefix / decoding state；
- 为了简洁，下面不在 $P_s$ 上显式写 $\theta$，但所有 $\nabla_\theta$ 都是对 student 参数求导。

这样三种目标的核心差别，本质上就变成了一个问题：**外层期望到底是对谁取的，以及 student 是不是先和 teacher 做了一次“混合”再被打分。**

- $D_{KL}(P_t(\cdot\mid s) \| P_s(\cdot\mid s))$ 是对 $P_t(\cdot\mid s)$ 取期望，所以它主要关心 teacher 在当前状态下认为哪些 token 重要；
- $D_{KL}(P_s(\cdot\mid s) \| P_t(\cdot\mid s))$ 是对 $P_s(\cdot\mid s)$ 取期望，所以它主要关心 student 当前自己把概率质量放到了哪里；
- $\mathrm{JSD}(P_t(\cdot\mid s) \| P_s(\cdot\mid s))$ 则先构造 $P_m(\cdot\mid s)=\frac{1}{2}(P_t(\cdot\mid s)+P_s(\cdot\mid s))$，再让 teacher 视角和 student 视角各退半步。

## 1.1 Forward KL：优化目标其实就是 teacher-weighted cross-entropy

**定义**

Forward KL 定义为：

$$
L_{\text{fwd}}
=
D_{KL}(P_t(\cdot\mid s)\|P_s(\cdot\mid s))
=
\sum_a P_t(a\mid s)\log \frac{P_t(a\mid s)}{P_s(a\mid s)}
$$

也可以写成期望形式：

$$
L_{\text{fwd}}
=
\mathbb{E}_{a\sim P_t(\cdot\mid s)}
\left[
\log P_t(a\mid s)-\log P_s(a\mid s)
\right]
$$

这个定义最关键的点在于：**外层期望是对 teacher 条件分布 $P_t(\cdot\mid s)$ 取的。** 也就是说，在当前状态 $s$ 下，teacher 认为概率高的 token，会天然在 loss 里占更大权重；student 就算暂时自己不太会，也逃不过这些位置上的监督。

**从 loss 视角看**

因为 teacher 分布 $P_t(\cdot\mid s)$ 是固定的，所以其中和 $\theta$ 无关的部分可以看成常数。于是：

$$
L_{\text{fwd}}
=
\text{const}
-
\sum_a P_t(a\mid s)\log P_s(a\mid s)
$$

这说明最小化 Forward KL，本质上就是最小化下面这个训练目标：

$$
L_{\text{train,fwd}}
=
-\sum_a P_t(a\mid s)\log P_s(a\mid s)
$$

换句话说，Forward KL 本质上就是在最小化一个 **teacher-weighted cross-entropy**[^tensortonic-kl]。从 loss 的形状上看，它关心的不是“student 现在会不会采到这个 token”，而是“teacher 是否认为这个 token 很重要”。所以只要 teacher 在多个峰上都给出较高概率，student 就必须尽量把这些峰都覆盖到；**漏掉任何一个 teacher 很看重的区域，loss 都会明显升高（如果teacher认为重要，$P_t$比较大，而学生认为不重要，$P_s$小，$\log P_s$大，整体loss会比较大）**。这就是 Forward KL 更偏 `mass-covering` 的根本原因。

**从梯度视角看**

它的梯度可以写成：

$$
\nabla_\theta L_{\text{train,fwd}}
=
-\sum_a P_t(a\mid s)\nabla_\theta \log P_s(a\mid s)
$$

这行式子背后的含义非常直接：

- teacher 在当前状态 $s$ 下认为概率高的 token（$P_t(a\mid s)$ 大），而 student 的概率很小（$\log P_s(a\mid s)$ 很低），那么这个 token 会得到更强的梯度牵引；
- **如果 teacher 在多个峰上都有明显概率，student 就必须尽量把这些峰都覆盖到；**
- 只要某个位置 teacher 认为“这里不能漏”，student 在这里给得太低，loss 就会上升得很快。

所以 Forward KL 的训练逻辑可以概括成一句话：**teacher 觉得重要的地方，你最好一个都别漏。**

这就是它为什么更像 teacher-driven 的 soft-label matching：监督来自 teacher 的分布，优化目标天然是覆盖 teacher 的高概率区域。[^hinton-kd]

## 1.2 Reverse KL：优化目标是对 student 自己采样结果做重加权

**定义**

Reverse KL 定义为：

$$
L_{\text{rev}}
=
D_{KL}(P_s(\cdot\mid s)\|P_t(\cdot\mid s))
=
\sum_a P_s(a\mid s)\log \frac{P_s(a\mid s)}{P_t(a\mid s)}
$$

把它写成期望的形式会更清楚：

$$
L_{\text{rev}}
=
\mathbb{E}_{a\sim P_s(\cdot\mid s)}
\left[
\log P_s(a\mid s)-\log P_t(a\mid s)
\right]
$$

这个定义最关键的点在于：**外层期望是对 student 条件分布 $P_s(\cdot\mid s)$ 取的**。

**从 loss 视角看**

从 loss 的形式上看，Reverse KL 不是要求 student 去覆盖 teacher 的整个分布，而是先看 student 当前自己把概率质量放在哪里，再检查这些位置在 teacher 分布下是否也合理。

换句话说，Forward KL 问的是“teacher 在状态 $s$ 下重视什么”；Reverse KL 问的是“**student 在状态 $s$ 下到底把概率放在了哪里**”。如果 student 把很多概率压在 teacher 几乎不认可的区域上，也就是说 $P_s(a\mid s)$ 比较大，而 $P_t(a\mid s)$ 比较小，那么

$$
\log \frac{P_s(a\mid s)}{P_t(a\mid s)}
$$

就会很大，loss 也会比较大，会惩罚这种行为。而只要 student 在某一个高概率区域和 teacher 比较一致，这个 loss 就可以比较小。

**从梯度视角看**

Reverse KL 是：

$$
L_{\text{rev}}
=
\sum_a P_s(a\mid s)
\left(
\log P_s(a\mid s)-\log P_t(a\mid s)
\right)
$$

为了简化记号，先把 $P_s(a\mid s)$ 写成 $P_{s,a}$，把 $P_t(a\mid s)$ 写成 $P_{t,a}$。因为 teacher 分布 $P_{t,a}$ 不依赖 $\theta$，所以：

$$
\nabla_\theta L_{\text{rev}}
=
\sum_a
\nabla_\theta
\left[
P_{s,a}(\log P_{s,a}-\log P_{t,a})
\right].
$$

对括号里这一项求导：

$$
\nabla_\theta
\left[
P_{s,a}(\log P_{s,a}-\log P_{t,a})
\right]
=
\nabla_\theta P_{s,a}\cdot(\log P_{s,a}-\log P_{t,a})
+
P_{s,a}\cdot\nabla_\theta\log P_{s,a}.
$$

第二项里：

$$
P_{s,a}\cdot\nabla_\theta\log P_{s,a}
=
P_{s,a}\cdot\frac{\nabla_\theta P_{s,a}}{P_{s,a}}
=
\nabla_\theta P_{s,a}.
$$

所以合起来就是：

$$
\nabla_\theta
\left[
P_{s,a}(\log P_{s,a}-\log P_{t,a})
\right]
=
\nabla_\theta P_{s,a}
\left(
\log P_{s,a}-\log P_{t,a}+1
\right).
$$

再用 score function 恒等式：

$$
\nabla_\theta P_{s,a}
=
P_{s,a}\nabla_\theta\log P_s(a\mid s),
$$

就得到严格梯度：

$$
\nabla_\theta L_{\text{rev}}
=
\sum_a
P_s(a\mid s)
\left(
\log P_s(a\mid s)-\log P_t(a\mid s)+1
\right)
\nabla_\theta\log P_s(a\mid s).
$$

写成期望形式就是：

$$
\nabla_\theta L_{\text{rev}}
=
\mathbb{E}_{a\sim P_s(\cdot\mid s)}
\left[
\left(
\log P_s(a\mid s)-\log P_t(a\mid s)+1
\right)
\nabla_\theta \log P_s(a\mid s)
\right].
$$

为什么可以把这个常数项去掉？因为对任意不依赖 action 的 baseline $b$，都有：

$$
\begin{aligned}
\mathbb{E}_{a\sim P_s(\cdot\mid s)}
\left[
b\nabla_\theta\log P_s(a\mid s)
\right]
&=
b\sum_a P_s(a\mid s)\nabla_\theta\log P_s(a\mid s) \\
&=
b\sum_a\nabla_\theta P_s(a\mid s) \\
&=
b\nabla_\theta \sum_a P_s(a\mid s) \\
&=
b\nabla_\theta 1 \\
&= 0.
\end{aligned}
$$

所以 $+1$ 是一个 action-independent baseline。它影响采样估计的方差，但不改变期望梯度。因此也可以写成更简洁的形式：

$$
\nabla_\theta L_{\text{rev}}
=
\mathbb{E}_{a\sim P_s(\cdot\mid s)}
\left[
\left(\log P_s(a\mid s)-\log P_t(a\mid s)\right)
\nabla_\theta \log P_s(a\mid s)
\right]
$$

真正决定更新方向的，核心就是这个去掉 baseline 后的系数：

$$
\log P_s(a\mid s)-\log P_t(a\mid s)
$$

注意，上面写的是 **loss 的梯度**；真正做梯度下降时，参数更新方向会取负号。因此如果把它反过来写成 policy optimization 里更熟悉的 advantage 样子，就是：

$$
A_{\text{rev}}(a)
=
\log P_t(a\mid s)-\log P_s(a\mid s)
$$

这时候整个过程就和 RL 非常像了：

- 如果在状态 $s$ 下，teacher 比 student 更认可这个 token，那么 $A_{\text{rev}}(a) > 0$，student 会被推动去提高它的概率；
- 如果在状态 $s$ 下，teacher 比 student 更不认可这个 token，那么 $A_{\text{rev}}(a) < 0$，student 会被推动去压低它的概率。

所以 Reverse KL 的训练逻辑更像：**先看 student 自己把概率放到了哪里，再让 teacher 对这些位置打分。**

## 1.3 JSD：先做一次混合，再给 student 一个更温和的 advantage

**定义**

JSD 定义为：[^jsd][^tensortonic-jsd]

$$
L_{\text{jsd}}
=
\frac{1}{2}D_{KL}(P_t(\cdot\mid s)\|P_m(\cdot\mid s))
+
\frac{1}{2}D_{KL}(P_s(\cdot\mid s)\|P_m(\cdot\mid s))
$$

其中

$$
P_m(a\mid s)
=
\frac{1}{2}\left(P_t(a\mid s)+P_s(a\mid s)\right)
$$

它的含义可以理解成：teacher 和 student 不再直接硬碰硬，而是**都先退到中间分布 $P_m$ 上，再分别衡量自己离这个“折中版本”有多远。**

和两个方向的 KL 相比，JSD 有两个非常重要的性质：

- 它是对称的，$\mathrm{JSD}(P_t(\cdot\mid s)\|P_s(\cdot\mid s))=\mathrm{JSD}(P_s(\cdot\mid s)\|P_t(\cdot\mid s))$；
- 它是有界的，$0\le \mathrm{JSD}(P_t(\cdot\mid s)\|P_s(\cdot\mid s))\le \log 2$。

这两个性质决定了它非常适合用来做一个更稳定的蒸馏目标。

**从 loss 视角看**

从 loss 的形式上看，JSD 把问题拆成了两半：

- $\frac{1}{2}D_{KL}(P_t(\cdot\mid s)\|P_m(\cdot\mid s))$ 保留了 teacher 视角，防止 student 把 teacher 的重要模式完全漏掉；
- $\frac{1}{2}D_{KL}(P_s(\cdot\mid s)\|P_m(\cdot\mid s))$ 保留了 student 视角，让优化仍然和 student 当前分布有关。

所以 JSD 既不像 Forward KL 那样一味要求全覆盖，也不像 Reverse KL 那样完全只盯着 student 当前已经采到的区域；它本质上是在“覆盖性”和“聚焦性”之间取了一个中间值。

**从梯度视角看**

和 Forward KL 不同，这里不能简单把第一项当常数扔掉，因为 $P_m(\cdot\mid s)$ 本身也含有 $P_s(\cdot\mid s)$。但如果直接对 $P_s(a\mid s)$ 求导，会得到一个很干净的结果：

$$
\frac{\partial L_{\text{jsd}}}{\partial P_s(a\mid s)}
=
\frac{1}{2}\log \frac{P_s(a\mid s)}{P_m(a\mid s)}
$$

于是对参数 $\theta$ 的梯度可以写成：

$$
\nabla_\theta L_{\text{jsd}}
=
\frac{1}{2}
\sum_a
\log \frac{P_s(a\mid s)}{P_m(a\mid s)}
\nabla_\theta P_s(a\mid s)
$$

或者写成 policy gradient 更熟悉的形式：

$$
\nabla_\theta L_{\text{jsd}}
=
\frac{1}{2}
\mathbb{E}_{a\sim P_s(\cdot\mid s)}
\left[
\log \frac{P_s(a\mid s)}{P_m(a\mid s)}
\nabla_\theta \log P_s(a\mid s)
\right]
$$

如果把它改写成 advantage 的样子，就是：

$$
A_{\text{jsd}}(a)
=
\frac{1}{2}
\left(
\log P_m(a\mid s)-\log P_s(a\mid s)
\right)
=
\frac{1}{2}
\log \frac{P_t(a\mid s)+P_s(a\mid s)}{2P_s(a\mid s)}
$$

这行式子的含义很值得体会：

- 如果 teacher 比 student 更认可这个 token，即 $P_t(a\mid s)>P_s(a\mid s)$，那么 $P_m(a\mid s)>P_s(a\mid s)$，所以 $A_{\text{jsd}}(a)>0$，student 会被推动去提高它的概率；
- 如果 student 已经比 teacher 更自信，那么 $A_{\text{jsd}}(a)<0$，这个 token 会被压一压；
- 但和 Reverse KL 的 $A_{\text{rev}}(a)=\log P_t(a\mid s)-\log P_s(a\mid s)$ 不同，**这里 teacher 的打分先经过了一层 $P_m$ 缓冲，所以更新会更温和。**

更关键的是，这个缓冲层把最危险的情况截断了。因为

$$
P_m(a\mid s)\ge \frac{1}{2}P_s(a\mid s)
$$

所以

$$
\frac{1}{2}\log \frac{P_s(a\mid s)}{P_m(a\mid s)}
\le
\frac{1}{2}\log 2
$$

等价地，

$$
A_{\text{jsd}}(a)\ge -\frac{1}{2}\log 2
$$

也就是说，当 student 在某个 teacher 几乎不认可的 token 上过度自信时，JSD 给出的负反馈仍然是有限的；它不会像纯 Reverse KL 那样，因为 $\log P_t(a\mid s)$ 非常小而一下子把梯度推到很极端。

# 2. 三种散度的训练偏好：覆盖、单峰选择与稳定折中

有了上面的定义、loss 形式和梯度视角之后，结合下面这张示意图就能更容易理解，为啥一个是 mode-covering，一个是 mode-seeking：[^zhihu-kl]
![kl-jsd-mode-preference](/assets/img/posts/opd_theory/kl-jsd-mode-preference.png)

假设在某个固定状态 $s$ 下，teacher 的条件分布有两个峰，中间是低谷：

- Forward KL 优化的是

$$
-\sum_a P_t(a\mid s)\log P_s(a\mid s)
$$

所以只要 teacher 在两个峰上都给了较高概率，student 就必须两边都给概率，否则漏掉任何一边都会被明显惩罚。结果就是：**分布更宽，更像在“覆盖所有峰”。**

- Reverse KL 优化的是

$$
\sum_a P_s(a\mid s)\log \frac{P_s(a\mid s)}{P_t(a\mid s)}
$$

它只关心 student 当前自己放了概率的地方。如果 student 把概率撒在两个峰中间那个低谷，那里 $P_t(a\mid s)$ 很小，那么惩罚会很重。所以它更倾向于：**不要把概率放到 teacher 的低概率区域，最好锁定到某一个峰上。**

- JSD 优化时真正起作用的系数是

$$
\frac{1}{2}\log \frac{P_s(a\mid s)}{P_m(a\mid s)}
=
\frac{1}{2}\log \frac{2P_s(a\mid s)}{P_t(a\mid s)+P_s(a\mid s)}
$$

它既不会像 Forward KL 那样要求 student 对所有峰都做硬覆盖，也不会像 Reverse KL 那样因为某个位置 $P_t(a\mid s)$ 太小就直接给出爆炸惩罚。结果就是：**JSD 的行为通常落在两者中间，既保留 teacher 对多个峰的牵引，又给 student 当前策略留了一层缓冲带。**

可以看一个非常小的例子。假设：

$$
P_t(\cdot\mid s)=[0.5, 0.5], \quad P_s(\cdot\mid s)=[1, 0]
$$

也就是 teacher 觉得两个 token 都合理，但 student 只锁死在第一个 token 上。

对于 Forward KL：

$$
D_{KL}(P_t(\cdot\mid s)\|P_s(\cdot\mid s))
=
0.5\log \frac{0.5}{1}
+
0.5\log \frac{0.5}{0}
=
\infty
$$

因为 teacher 明明在第二个峰上也有概率，但 student 完全没有覆盖到。

而对于 Reverse KL：

$$
D_{KL}(P_s(\cdot\mid s)\|P_t(\cdot\mid s))
=
1\cdot \log \frac{1}{0.5}
=
\log 2
$$

这是一个有限值。也就是说，Reverse KL 是允许你“只押中一个峰”的，这正是它更容易 mode-seeking 的原因。

如果换成 JSD，这时混合分布变成

$$
P_m(\cdot\mid s)=\frac{1}{2}(P_t(\cdot\mid s)+P_s(\cdot\mid s))=[0.75, 0.25]
$$

于是第二个峰虽然被 student 漏掉了，但分母不再是 0，而是 0.25。JSD 仍然会告诉 student“你漏了一块”，只是这个信号不再是无穷大的硬惩罚，而是一个可控、平滑的修正。

# 3. 放到 OPD 里：两种 loss 计算方式

最后再把上面这三种目标压回到 `On-Policy Distillation` 的真实实现里看。前面我们一直固定一个状态 $s$，真实训练时则会沿着 student rollout 产生一串**前缀状态**。这里的 $s_t$ 不是第 $t$ 个 token，而是“在生成第 $t$ 个 token 之前，模型已经看到的全部上下文”。

如果输入 prompt 是 $x$，student 已经生成了 $y_1,\ldots,y_{t-1}$，那么第 $t$ 步的状态是：

$$
s_t=(x,y_{<t}).
$$

所以状态之间的递推关系是：

$$
s_1=(x),
\qquad
y_t\sim P_s(\cdot\mid s_t),
\qquad
s_{t+1}=(x,y_{\le t})=(s_t,y_t).
$$

等价地，对 $t>1$ 有：

$$
s_t=(s_{t-1},y_{t-1}).
$$

因此，$P_t(\cdot\mid s_t)$ 表示 teacher 在“当前完整前缀 $s_t$”上预测下一个 token $y_t$ 的分布，$P_s(\cdot\mid s_t)$ 表示 student 在同一个前缀状态上的 next-token 分布。这里的条件变量 $s_t$ 是 prefix state，不是某一个单独 token。

这里最容易混的地方是：`on-policy distillation` 这个词下面其实有两种不同的计算方式。[^tm-opd]

作为背景，传统 token-level KD 通常是在固定数据前缀上匹配 teacher 的 soft distribution，而 `SeqKD` 则先让 teacher 生成完整序列，再把这条 teacher-generated sequence 当成 hard label 训练 student。[^hinton-kd][^seqkd]

第一种是 `GKD-style`：student rollout 只是用来提供 prefix state，采样路径本身不走 policy-gradient；真正的 loss 仍然是在这些 prefix 上算 full-vocab divergence。

第二种是 `PG-style / MiniLLM-style`：把 student sample 出来的 token 当成 policy action，用 teacher/student 的 logprob ratio 构造 reward 或 advantage，再接 policy-gradient 形式的 loss。

## 3.1 GKD-style

GKD 的关键是把训练状态从固定数据前缀换成 student 自己会访问到的前缀。[^gkd] 设输入是 $x$，student 先生成一条轨迹：

$$
\tilde{y}\sim \operatorname{stopgrad}\left(P_s(\cdot\mid x)\right).
$$

这里的 $\operatorname{stopgrad}$ 很重要：它表示这条轨迹只是被当作训练样本，用来产生前缀状态，不对采样过程本身做 REINFORCE / policy-gradient 求导。

第 $t$ 步的状态可以写成：

$$
s_t=(x,\tilde{y}_{<t}).
$$

然后在每个 student visited state 上，比较 teacher 和 student 的完整 next-token 分布：

$$
L_{\text{GKD}}
=
\mathbb{E}_{x}
\mathbb{E}_{\tilde{y}\sim \operatorname{stopgrad}(P_s(\cdot\mid x))}
\left[
\frac{1}{T}
\sum_{t=1}^{T}
\mathcal{D}_t
\right].
$$

其中 $\mathcal{D}_t$ 可以选择 Forward KL、Reverse KL 或 JSD。

如果选择 Forward KL：

$$
\mathcal{D}^{\text{fwd}}_t
=
D_{KL}
\left(
P_t(\cdot\mid s_t)
\|
P_s(\cdot\mid s_t)
\right)
=
\sum_a
P_t(a\mid s_t)
\log
\frac{
P_t(a\mid s_t)
}{
P_s(a\mid s_t)
}.
$$

因为 teacher 分布不依赖 student 参数，训练时等价于最小化一个 full-vocab soft-label cross entropy：

$$
L^{\text{fwd}}_t
=
-
\sum_a
P_t(a\mid s_t)
\log P_s(a\mid s_t).
$$

如果选择 Reverse KL：

$$
\mathcal{D}^{\text{rev}}_t
=
D_{KL}
\left(
P_s(\cdot\mid s_t)
\|
P_t(\cdot\mid s_t)
\right)
=
\sum_a
P_s(a\mid s_t)
\log
\frac{
P_s(a\mid s_t)
}{
P_t(a\mid s_t)
}.
$$

如果选择 JSD，先定义完整分布上的 mixture：

$$
P_m(a\mid s_t)
=
\frac{1}{2}
\left(
P_t(a\mid s_t)+P_s(a\mid s_t)
\right).
$$

那么：

$$
\mathcal{D}^{\text{jsd}}_t
=
\frac{1}{2}
D_{KL}
\left(
P_t(\cdot\mid s_t)
\|
P_m(\cdot\mid s_t)
\right)
+
\frac{1}{2}
D_{KL}
\left(
P_s(\cdot\mid s_t)
\|
P_m(\cdot\mid s_t)
\right).
$$

所以 `GKD-style` 的重点不是“只看 student 采样到的那个 token”，而是：

$$
\nabla_\theta L_{\text{GKD}}
\approx
\mathbb{E}_{x,\tilde{y}\sim \operatorname{stopgrad}(P_s)}
\left[
\frac{1}{T}
\sum_{t=1}^{T}
\nabla_\theta
\mathcal{D}
\left(
P_t(\cdot\mid s_t),
P_s(\cdot\mid s_t)
\right)
\right].
$$

也就是说，GKD 的 `on-policy` 主要体现在 **state distribution** 上：让 student 自己走到一些前缀状态，再在这些状态上做 token-level distillation。它仍然更像 supervised learning，所以训练信号 dense、**方差低，也更稳定**。

## 3.2 PG-style / MiniLLM-style

另一种写法更接近 `MiniLLM` [^minillm]或 RL-style OPD。这里 student 不只是产生 prefix state，还会把自己采样到的 token 当作 policy action：

$$
y_t\sim P_s(\cdot\mid s_t).
$$

teacher 不一定要提供完整词表分布；最关键的是能给 sampled token 一个 logprob[^tm-opd]：

$$
\log P_t(y_t\mid s_t).
$$

student 自己也有：

$$
\log P_s(y_t\mid s_t).
$$

于是可以定义单步 log-ratio reward：

$$
r_t
=
\log
\frac{
P_t(y_t\mid s_t)
}{
P_s(y_t\mid s_t)
}
=
\log P_t(y_t\mid s_t)
-
\log P_s(y_t\mid s_t).
$$

如果只看这个单步项，可以把它写成一个局部 advantage：

$$
A_t^{\text{local}}
=
\beta r_t
=
\beta
\left(
\log P_t(y_t\mid s_t)
-
\log P_s(y_t\mid s_t)
\right).
$$

再接到 policy-gradient 风格的 loss 上：

$$
L^{\text{local}}_{\text{pg},t}
=
-
\operatorname{stopgrad}
\left(
A_t^{\text{local}}
\right)
\log P_s(y_t\mid s_t).
$$

这个式子很直观：如果 teacher 比 student 更认可当前 sampled token，那么 $A_t^{\text{local}}>0$，梯度会提高这个 token 的概率；反过来，如果 teacher 不认可这个 token，就会压低它的概率。

但要注意：这只是一个 **sampled-token / single-step surrogate**。它不是 GKD 里的 full-vocab reverse KL，也不是 MiniLLM 完整的 sequence-level reverse KL。

MiniLLM 更完整的推导是从 sequence-level reverse KL 开始：[^minillm]

$$
L_{\text{seq-rev}}
=
D_{KL}
\left(
P_s(y\mid x)
\|
P_t(y\mid x)
\right)
=
\mathbb{E}_{y\sim P_s(\cdot\mid x)}
\left[
\log P_s(y\mid x)-\log P_t(y\mid x)
\right].
$$

它的 policy-gradient 形式会出现 reward-to-go(当前step的reward依赖后面token的reward)：

$$
R_t
=
\sum_{t'=t}^{T}
\log
\frac{
P_t(y_{t'}\mid s_{t'})
}{
P_s(y_{t'}\mid s_{t'})
}.
$$

对应梯度可以写成：

$$
\nabla_\theta L_{\text{seq-rev}}
=
-
\mathbb{E}_{y\sim P_s}
\sum_{t=1}^{T}
\left(
R_t-1
\right)
\nabla_\theta
\log P_s(y_t\mid s_t).
$$

MiniLLM 后面又把这个目标拆成 single-step term 和 long-horizon term，用 teacher-mixed sampling、length normalization 等技巧去降低方差和防止 reward hacking。[^minillm]

JSD 也可以写成 sampled-token 的 PG-style surrogate。先在 sampled token 上定义：

$$
\log P_m(y_t\mid s_t)
=
\operatorname{logaddexp}
\left(
\log P_t(y_t\mid s_t),
\log P_s(y_t\mid s_t)
\right)
-\log 2.
$$

那么 sampled-token JSD 的局部 advantage 可以写成：

$$
A_t^{\text{jsd-local}}
=
\frac{\beta}{2}
\left(
\log P_m(y_t\mid s_t)
-
\log P_s(y_t\mid s_t)
\right).
$$

再接：

$$
L^{\text{jsd-local}}_{\text{pg},t}
=
-
\operatorname{stopgrad}
\left(
A_t^{\text{jsd-local}}
\right)
\log P_s(y_t\mid s_t).
$$

这个写法和前面的 GKD-style JSD 不是同一个实现对象：GKD-style JSD 是对完整词表分布求 divergence；PG-style JSD 是只在 sampled token 上构造一个局部 advantage。

最后可以用一张表来区分：

| 维度                 | GKD-style                                    | PG-style / MiniLLM-style                                    |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| on-policy 体现在哪里 | student rollout 产生 prefix state            | student sample 同时进入 policy-gradient                     |
| 是否对采样路径求导   | 否，rollout 通常 stop-gradient               | 是，用 score function / REINFORCE 形式                      |
| 单步训练信号         | full-vocab divergence                        | sampled-token reward / advantage                            |
| teacher 需要提供什么 | 当前 prefix 下的 token distribution / logits | sampled token 的 logprob，完整版本也可用 token logprob 序列 |
| 方差和稳定性         | 更像 supervised KD，方差低                   | 更像 RL，方差更高，需要稳定化技巧                           |
| 代表工作             | GKD / generalized on-policy KD               | MiniLLM / policy-gradient OPD                               |

所以这一节里最重要的区分是：

**GKD-style 是“student 自己走到状态，然后在这些状态上做 full-vocab KD”；PG-style 是“student 自己采样动作，然后用 teacher/student logprob ratio 构造 advantage”。**

# 参考文献

[^jsd]: Jianhua Lin, _Divergence Measures Based on the Shannon Entropy_, IEEE Transactions on Information Theory, 1991. DOI: https://doi.org/10.1109/18.61115
[^hinton-kd]: Geoffrey Hinton, Oriol Vinyals, Jeff Dean, _Distilling the Knowledge in a Neural Network_, 2015. arXiv: https://arxiv.org/abs/1503.02531
[^tensortonic-kl]: TensorTonic, _KL Divergence_, https://www.tensortonic.com/ml-math/information-theory/kl-divergence
[^tensortonic-jsd]: TensorTonic, _Jensen-Shannon Divergence_, http://tensortonic.com/ml-math/information-theory/jensen-shannon
[^seqkd]: Yoon Kim, Alexander M. Rush, _Sequence-Level Knowledge Distillation_, 2016. arXiv: https://arxiv.org/abs/1606.07947
[^gkd]: Mihir Prabhudesai, Aniruddha Kembhavi, Ali Farhadi, Mohammad Rastegari, _On-policy Distillation of Language Models: Learning from Self-Generated Mistakes_, 2023. arXiv: https://arxiv.org/abs/2306.13649
[^minillm]: Yuxian Gu, Li Dong, Furu Wei, Minlie Huang, _MiniLLM: Knowledge Distillation of Large Language Models_, 2023. arXiv: https://arxiv.org/abs/2306.08543
[^tm-opd]: Thinking Machines Lab, _On-Policy Distillation_, 2025. Blog: https://thinkingmachines.ai/blog/on-policy-distillation/
[^zhihu-kl]: 吴宇斌，关于 Forward KL / Reverse KL / JSD 直觉图解的知乎文章：https://zhuanlan.zhihu.com/p/1992696535025214593
