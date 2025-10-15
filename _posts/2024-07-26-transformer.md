---
layout: post
title: "Transformer Architecture Explained: Attention is All You Need"
date: 2024-07-26 11:50 +0800
categories: [AI, Large Language Models]
tags: [Machine Learning, LLM]
math: true
---

🚀在自然语言处理（NLP）领域，Transformer架构已经成为最先进的技术之一，其核心概念是自注意力机制（Self-Attention Mechanism）。

📚在前面的两小节中，我们已经介绍了注意力机制的基础知识，包括RNN、Seq2Seq等传统方法的基本概念和实现。此外，我们详细讨论了自注意力机制（Self-Attention）及其在现代NLP模型中的重要性。自注意力机制允许模型在处理每个输入时“关注”输入序列的不同部分，从而理解单词与其他单词之间的关系，而不是逐个地线性处理输入。

🔥在理解了自注意力机制的基础上，我们来介绍大语言模型的基础——Transformer结构，Attention is all you need！

## 一、Transformer框架

**Transformer** 的核心概念是 **自注意力机制（Self-Attention Mechanism）**，它允许模型在处理每个输入时“关注”输入序列的不同部分。这种机制让模型能够理解每个单词或符号与其他单词或符号之间的关系，而不是逐个地线性处理输入。原始论文给出的Transformer结构如下图所示：

![截屏2024-07-15 16.24.24](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407151624024.png)

上图所示的Transformer 主要由两个部分组成：

- **编码器（Encoder）**：将输入序列转换为一个隐表示（向量表示）；
- **解码器（Decoder）**：从隐表示生成输出序列.

**编码器** 和 **解码器** 都由多个**层（layers)** 组成，每层都包括:

1. 一个 **多头自注意力机制** ;
2. 一个 **前馈神经网络（Feed-Forward Neural Network, FFN）**；
3. **残差结构以及层归一化操作**.

下面详细分析Transformer结构每个部分的作用及计算过程。

## 二、Encoder

### （1）自注意力机制

在上一小节我们详细介绍了注意力机制，本节我们仅介绍其在Transformer结构中的计算过程。对于输入序列$\mathbf{X}=[x_1,x_2,\ldots,x_n]$,每个元素$x_i$首先被投影到三个不同的向量 :

1. 查询向量(Query)Q
2. 键向量( Key) K
3. 值向量( Value) V

这些向量的计算公式如下：

$$
\mathbf{Q}=\mathbf{X}\mathbf{W}^Q,\quad\mathbf{K}=\mathbf{X}\mathbf{W}^K,\quad\mathbf{V}=\mathbf{X}\mathbf{W}^V
$$

其中，$\mathbf{W}^Q,\mathbf{W}^K,\mathbf{W}^V$是可学习的权重矩阵。自注意力的核心公式是计算每个查询向量与所有键向量之间的相似度，原文采用的是缩放点积模型 :

$$
\text{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V})=\text{softmax}\biggl(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}}\biggr)\mathbf{V}
$$

这里，$\frac1{\sqrt{d_k}}$是缩放因子，**用于避免相似度值过大**。softmax 函数将相似度转换为权重，最后乘以 V 得到加权的值向量。下面用一个实例的图示来描述这个计算过程，并且能够清晰的看到各个部分的维度：

![截屏2024-07-21 15.17.02](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211517524.png)

如上图所示，$X_1,X_2$分别与$\mathbf{W}^Q,\mathbf{W}^K,\mathbf{W}^V$相乘可以得到$q、k、v$，下面假设一些值进行计算：

![截屏2024-07-21 15.18.22](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211518279.png)

可以看到最后得到的注意力值$z_i$维度和$v_i$的维度一致.如果$X_1,X_2$拼接成矩阵，那么其计算过程图示如下：

![截屏2024-07-21 15.23.50](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211523009.png)

可以看到最后的$Z$就是由$z_1,z_2$拼接得到，并且$Z$与$V$的维度仍保持一致.

### （2）多 头 注 意 力 机 制 ( Multi- Head Attention )

为了让模型捕捉到不同子空间的特征，多头注意力机制将上述注意力机制应用多个头( head ) :

$$
\mathrm{MultiHead}( \mathbf{Q} , \mathbf{K} , \mathbf{V} ) = [ \mathrm{head}_1, \mathrm{head}_2, \ldots , \mathrm{head}_h] \mathbf{W} ^O
$$

其中，每个 head$_i$是一个独立的自注意力机制 :

$$
\mathrm{head}_i=\mathrm{Attention}(\mathbf{QW}_i^Q,\mathbf{KW}_i^K,\mathbf{VW}_i^V)\\
$$

$\mathbf{W}^O$是用于连接各个头结果的权重矩阵.下面用一个图例来描述多头注意力机制的计算过程：

![截屏2024-07-21 15.33.17](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211533446.png)

如上图所示，$h=2$，左右两边结构完全一样，每个head的计算方式也完全一样。当$h=8$时，我们可以计算得到8个$Z_i$：

![截屏2024-07-21 15.35.35](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211535208.png)

多头注意力机制就是将多个head的输出拼接起来，同时再乘以一个大的参数矩阵$W^O$

![截屏2024-07-21 15.36.03](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211536896.png)

由上图可知，**最后得到的$Z$的维度与$X$的维度保持一致.这是为了方便后面的layer当作输入，在Encoder结构中，只有第一层需要将输入Embedding成$X$，后面的层直接使用上一层的输出当作输入**.下图是一个多头注意力机制计算过程的完整图示：

![截屏2024-07-21 15.54.22](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211554008.png)

到目前为止介绍的多头注意力机制结构存在两个问题：

1. 与循环神经网络不同，自注意力机制并**不按顺序构建信息**，这个结构没有对输入顺序的内在表示，也就是说，输入的顺序完全不影响网络输出，但是我们知道句子里单词的顺序是重要的。所以Transformer结构中中引入了一个技巧——**位置编码（Positional Encoding）**.
2. 注意到在上面的计算过程中，除了Softmax都是线性计算，使得网络的表达能力受限，Transformer中在每个多头注意力机制后引入一个**前 馈 神 经 网 络 ( Feed- Forward Network ）**来增强网络的表示能力.

### （3）位置编码（Positional Encoding）

为了编码每个词的位置信息，原始论文中提出用一个新的向量$p_i$来编码位置信息，其维度和Embedding的维度一致，在编码器的第一层，我们将$p_i$与$x_i$叠加得到最终的输入向量矩阵$X$.

![截屏2024-07-21 16.10.43](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211610228.png)

这个位置向量怎么得到呢？有以下几种方法：

1. 绝对位置编码:正弦位置表示，原论文给的计算公式如下：

   $$
   \begin{aligned}PE_{(pos,2i)}&=\sin(pos/10000^{2i/d_{\mathrm{model}}})\\PE_{(pos,2i+1)}&=\cos(pos/10000^{2i/d_{\mathrm{model}}})\end{aligned}
   $$

   其中：

   - pos表示单词在句子中的绝对位置，pos=0，1，2…，例如：Jerry在"Tom chase Jerry"中的pos=2；
   - $d_{model}$表示词向量的维度，在这里$d_{model}$=512；
   - 2i和2i+1表示奇偶性，i表示词向量中的第几维，例如这里$d_{model}$=512，故i=0，1，2…255.

2. 绝对位置编码:通过学习表示，$p_i$是一个可学习的参数，通过训练来学习到每个词的位置表示.

### （4）残差（Residuals)

由Transformer的结构我们可以看到，在经过Multi-Head Attention得到矩阵$Z$之后，并没有直接传入全连接神经网络FNN，而是经过了一步：Add＆Normalize。

Add，就是在Z的基础上加了一个残差块X，加入残差块X的目的是为了防止在深度神经网络训练中发生退化问题，退化的意思就是深度神经网络通过增加网络的层数，Loss逐渐减小，然后趋于稳定达到饱和，然后再继续增加网络层数，Loss反而增大。

![截屏2024-07-21 16.30.14](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211630840.png)

### （5）层归一化

在进行了残差连接后，还要对数据进行层归一化，其目的有二：

1. 能够加快训练的速度;
2. 提高训练的稳定性.

为什么使用Layer Normalization（LN）而不使用Batch Normalization（BN）呢？，LN是在同一个样本中不同神经元之间进行归一化，而BN是在同一个batch中不同样本之间的同一位置的神经元之间进行归一化。对多个词向量进行BN归一化没有意义，但是可以对每个词向量的数据进行归一化，加快训练速度。

对于给定的输入$x$,其维度为$(N,L)$,其中$N$是批量大小(词的个数），$L$是特征维度（词向量维度）。层归一化的计算公式为：

$$
\mu=\frac1L\sum_{j=1}^Lx_{ij}\\
\sigma^2=\frac1L\sum_{j=1}^L(x_{ij}-\mu)^2\\
\hat{x}_{ij}=\frac{x_{ij}-\mu}{\sqrt{\sigma^2+\epsilon}}\\
y_{ij}=\gamma\hat{x}_{ij}+\beta
$$

其中，$\gamma$和$\beta$是可训练参数，$\epsilon$是防止除零的小常数。

### （6）前 馈 神 经 网 络 ( Feed- Forward Network ）

每个编码器和解码器层还包括一个前馈神经网络：

$$
\mathrm{FFN}(\mathbf{x})=\max(0,\mathbf{x}\mathbf{W}_1+\mathbf{b}_1)\mathbf{W}_2+\mathbf{b}_2
$$

这里的全连接层是一个两层的神经网络，先线性变换，然后ReLU非线性，再线性变换。这里的x就是我们Multi-Head Attention的输出Z，若Z是(2,64)维的矩阵，假设W1是(64,1024)，其中W2与W1维度相反(1024,64)，那么按照上面的公式：

$$
FFN(Z)=(2,64)\times(64,1024)\times(1024,64)=(2,64)
$$

我们发现维度没有发生变化，这两层网络就是为了将输入的Z映射到更加高维的空间中(2,64)x(64,1024)=(2,1024)，然后通过非线性函数ReLU进行筛选，筛选完后再变回原来的维度。然后经过Add＆Normalize，输入下一个encoder中，经过6个encoder后输入到decoder中.

## 三、Decoder

接下来来看Decoder部分，其结构如下所示，和Encoder很像，但是多了一个Masked Multi-Head Attention层，这是干嘛用的呢？这是为了防止Decoder在训练的时候“作弊”，在每个时间步t只允许看到这之前的信息，不能利用t+1后的信息。下面来详细的介绍每个部分。

![截屏2024-07-21 18.30.23](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211830605.png)

### （1）解码器的输入

Decoder的输入分为两类：一种是训练时的输入，一种是预测时的输入。

1. 训练时的输入就是已经对准备好对应的target数据。例如翻译任务，Encoder输入"Tom chase Jerry"，Decoder输入"汤姆追逐杰瑞"。
2. 预测时的输入，一开始输入的是起始符，然后每次输入是上一时刻Transformer的输出。例如，输入""，输出"汤姆"，输入"汤姆"，输出"汤姆追逐"，输入"汤姆追逐"，输出"汤姆追逐杰瑞"，输入"汤姆追逐杰瑞"，输出"汤姆追逐杰瑞"结束。

下面动图所示是解码器的第一个时间步，输入是起始符，不过也会用到编码器的信息：

![transformer_decoding_1](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211843754.gif)

下面动图展示了Decoder后面几个时间步的输入，是上一个时间步解码器的输入：

![transformer_decoding_2](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211843554.gif)

### （2）Masked Multi-Head Attention

与Encoder的Multi-Head Attention计算原理一样，只是多加了一个mask码。mask 表示掩码，它对某些值进行掩盖，使其在参数更新时不产生效果。两种模型的结构对比如下图所示：

![截屏2024-07-21 19.01.53](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211901018.png)

Transformer 模型里面涉及两种 mask，分别是 padding mask 和 sequence mask。为什么需要添加这两种mask码呢？

==1.padding mask==
什么是 padding mask 呢？因为每个批次输入序列长度是不一样的也就是说，我们要对输入序列进行对齐。具体来说，就是给在较短的序列后面填充 0。但是如果输入的序列太长，则是截取左边的内容，把多余的直接舍弃。因为这些填充的位置，其实是没什么意义的，所以我们的attention机制不应该把注意力放在这些位置上，所以我们需要进行一些处理。
具体的做法是，把这些位置的值加上一个非常大的负数(负无穷)，这样的话，**经过 softmax，这些位置的概率就会接近0！**

==2.sequence mask==
sequence mask 是**为了使得 decoder 不能看见未来的信息。**对于一个序列，在 time_step 为 t 的时刻，我们的解码输出应该只能依赖于 t 时刻之前的输出，而不能依赖 t 之后的输出。因此我们需要想一个办法，把 t 之后的信息给隐藏起来。这在训练的时候有效，因为训练的时候每次我们是将target数据完整输入进decoder中地，预测时不需要，预测的时候我们只能得到前一时刻预测出的输出。

通过sequence mask，可以使得网络进行并行计算.具体做法是在每个时间步t，我们屏蔽对未来词的注意力，将对未来的词（token）的attention值设置为-∞，其余部分的Attention值计算同前面介绍的方法一致，下图给出了一个示例：

![image-20240721190529252](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211905309.png)

Decoder中的Multi-Head Attention层的工作原理和Encoder一样，**只是它从下面的Masked Multi-Head Attention层创建查询矩阵Q，并从编码器堆栈的输出中获取键和值矩阵（K、V）。**

### （3）Decoder的输出

解码器输出一个浮点数向量，如何将其转化为一个单词呢？这就是最终的线性层（Linear layer）和后续的Softmax层的工作。

![截屏2024-07-21 19.17.51](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211917409.png)

线性层是一个简单的全连接神经网络，它将解码器生成的向量投射到一个更大得多的向量上，这个向量称为**logits向量**。假设我们的模型知道10,000个独特的英文单词（模型的“输出词汇”），这些单词是从训练数据集中学习到的。这将使logits向量为10,000维，每维对应一个唯一单词的得分。这就是我们通过线性层解释模型输出的方式。然后，Softmax层将这些得分转化为概率（所有概率都是正数，总和为1.0）。选择概率最高的index，并将其对应的单词作为该时间步的输出。

## 四、复杂度分析及改进方法介绍

总的来说，自注意力模型的时间和空间复杂度与**输入序列长度$N$呈2次关系**，可以不严格的表示为$O(N^2)$.

### （1）时间复杂度

![截屏2024-07-21 19.28.20](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211928934.png)

![截屏2024-07-21 19.29.49](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211929340.png)

### （2）空间复杂度

![截屏2024-07-21 19.30.31](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211930137.png)

### （3）改进方法

通过上面两小节的分析，我们知道Self Attention的时间和空间复杂度是输入序列的$O(N^2)$，这对于处理长文本来说效率太低了，目前学界提出了很多改进Self Attention模型的方法：

![截屏2024-07-21 19.44.28](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407211944746.png)

## 参考资料

1. [Attention is all you need](https://proceedings.neurips.cc/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)
2. [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
3. https://blog.csdn.net/Tink1995/article/details/105080033
