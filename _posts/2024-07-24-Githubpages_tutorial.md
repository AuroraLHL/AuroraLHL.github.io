---
layout: post
title:  "Building Personal Website with GitHub Pages"
categories: [各种教程,网站搭建]
tags: [网站搭建,Github]
---
## 前言

23年7月份我第一次搭建了自己的个人博客，用的是WordPress+Argon模板，效果如下：

![截屏2024-07-26 11.04.21](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407261106424.png)

放弃继续使用这个网站有两个原因：

1. 由于当时买的是阿里的轻量级服务器，感觉每次访问速度都比较慢，并且服务器和域名续费居然比一开始买还高很多。
2. WordPress还有一个较大的问题是对md文件公式的支持不太好，我写的含有数学公式的md文件直接上传网站公式会显示有问题。

于是放弃WordPress，转而用Github Pages+Jekyll模板搭建。下面记录Github个人网站的搭建过程。

## 一、介绍

### 1 Github Pages是什么

Github Pages官网： [https://pages.github.com/](https://pages.github.com/)

 GitHub Pages 是 GitHub 提供的一个免费的静态网站托管服务，它允许 GitHub 用户创建和托管自己的静态网站，这些网站可以通过特定的 GitHub 仓库进行管理和托管。

GitHub Pages 的主要特点包括：

+ **免费托管**： GitHub Pages 提供免费的静态网站托管服务，允许用户将自己的网站内容托管在 GitHub 上，用户不需要支付额外的托管费用；
+ **使用简单：** 创建和管理 GitHub Pages 静态网站相对简单，特别是对于熟悉 GitHub 的用户来说，用户只需在自己的 GitHub 帐户中创建一个特定名称的仓库，将网站文件上传到该仓库即可；
+ **自定义域名：** 用户可以选择使用自定义域名来访问他们的 GitHub Pages 网站，这使得它们更适合个人网站、博客和项目页面；
+ **支持多种静态网站生成工具：** GitHub Pages 支持多种静态网站生成工具，如 Jekyll、Hugo、Gatsby 等，以及纯HTML、CSS 和 JavaScript 等前端技术，这使得用户能够根据自己的需求选择适合他们的工具；
+ **自动构建：** GitHub Pages 可以自动构建用户上传的网站内容，无需用户手动生成或编译网页，这使得发布网站变得更加简单。

对于开发人员和技术爱好者来说， GitHub Pages 是一个很好的选择，用于托管个人网站、博客、文档、项目页面等静态内容，它提供了一个方便的方式来分享和展示自己的作品。

### 2 静态网站生成工具

GitHub Pages支持多种静态网站生成工具。以下是一些GitHub Pages支持的主要静态网站生成工具：

+ Jekyll（ [https://jekyllrb.com](https://jekyllrb.com)）： Jekyll是GitHub Pages的默认静态网站生成工具，它使用Markdown文件和Liquid模板引擎来创建静态网站，Jekyll对于博客和文档站点非常流行。
+ Hugo（ [https://gohugo.io/](https://gohugo.io/)）： Hugo是另一个受欢迎的静态网站生成工具，它非常快速且易于使用，它使用Go语言编写，支持多种主题和内容组织方式。
+ Gatsby（ [https://www.gatsbyjs.com/](https://www.gatsbyjs.com/)）： Gatsby是基于React的静态网站生成工具，它可以构建高性能、现代化的网站，Gatsby适用于博客、电子商务、应用程序文档等。
+ VuePress（ [https://vuepress.vuejs.org/](https://vuepress.vuejs.org/)）： VuePress是Vue.js驱动的静态网站生成工具，专注于文档站点，它支持Markdown文件和Vue组件。
+ Hexo（ [https://hexo.io/](https://hexo.io/)）： Hexo是一个快速、简单的博客框架，使用Markdown文件来生成静态博客，它是Node.js应用程序。

这些静态网站生成工具各有利弊，我选择了Jekyll，下面简要介绍一下Jekyll及其使用。

### 3 Jekyll

#### 简介

Jekyll 是一个**静态网站生成器，可以帮助我们使用简单的文本文件来创建静态网站。**我们可以使用Markdown, HTML, CSS 以及 Liquid 模板语言来编写内容和设计网站布局。其特点如下：

+ Jekyll 将这些文件转换成静态网页,我们可以将这些生成的网页文件直接部署到网站托管服务上 (不一定放在GitHub 里，放在你自己的服务器上加上买个域名也可以)。
+ Jekyll 模板是其他人搭好的一个框架，在我们不需要操心其他样式的时候，我们只需要写
  Markdown 文件就可以生成想要的静态网页。这就像我们制作 PPT 时用的其他人写好的模板，然
  后我们只需要往里面填内容就行。当然如果我们想进行个性化修改，就得去扒一下模板的源码，
  看看如何修改 CSS 和 HTML 文件了。

#### Jekyll 和 GitHub 的关系

GitHub 支持使用 Jekyll 构建和托管网站。**我们可以在 GitHub 上创建一个特定的仓库，将 Jekyll 项目代码“推送到该仓厍中。GitHub 将自动检测到这是一个 Jekyll 项目，并在后台使用 Jekyll 构建网站。**我们可以通过 GitHub Pages 服务将该网站部署到一个专门的域名，也就是：`username.github.io`

> 总的来说就是：**本地Jekyll项目+远程Github Pages**.具体步骤就是：
>
> 1. 在Github上创建一个 `username.github.io`的仓库，用于托管网站；
> 2. 在本地用Jekyll创建一个网站项目，上传到Github的仓库（当然可以用模板）；
>    {: .prompt-tip}

### 4 Mac系统Jekyll的安装及使用

#### 安装

要在 mac上安装 Jekyll，需要确保系统已安装 Ruby，通常mac预装了Ruby，我们不要使用系统的ruby，否则会有冲突，以下是安装 Jekyll 的步骤以及注释：

```bash
# homebrew安装ruby
brew install ruby

# 通过以下命令，可以查看ruby的安装路径
brew info ruby

# 安装完成以后，修改.bash_profile文件,path路径加多/opt/homebrew/opt/ruby/bin，例如：export PATH=/opt/homebrew/opt/ruby/bin:$PATH
vi ~/.zshrc
source ~/.zshrc

# 验证ruby 版本，如果打印最新的版本，如：ruby 3.x.x表示安装最新的了
ruby -v

# 安装Jekyll
gem install --user-install bundler jekyll

# 安装成功之后，调整gem的运行环境(gem的bin目录一般在~/.gem/ruby/ruby版本/bin目录),export PATH路径增加“$HOME/.gem/ruby/ruby版本/bin”
vi ~/.zshrc
source ~/.zshrc

# 验证jekyll安装是否成功
jekyll -v
```

#### Jekyll的简单使用

首先，新建一个jekyll项目：

```bash
jekyll new test-site
```

运行过程如下：

![截屏2024-07-24 13.05.31](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241305592.png)

打开test-site文件夹，可以看到有以下一些文件：

![截屏2024-07-24 13.06.27](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241306392.png)

在终端进入对应项目目录，然后执行：

```bash
bundle exec jekyll serve
```

可以看到项目以及启动：

![截屏2024-07-24 13.08.16](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241308944.png)

在浏览器可以访问对应的地址(http://http://127.0.0.1:4000)即能在本地预览

![截屏2024-07-24 13.09.26](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241309367.png)

在Jekyll生成项目的目录下，有一个比较重要的文件：`_config.yaml`，这个config文件用于指定 Jekyll 站点的各种设置和选项，包含了许多可配置的选项，用于自定义网站的行为和外观，生成的文件内容如下:

```yaml
# Welcome to Jekyll!
#
# This config file is meant for settings that affect your whole blog, values
# which you are expected to set up once and rarely edit after that. If you find
# yourself editing this file very often, consider using Jekyll's data files
# feature for the data you need to update frequently.
#
# For technical reasons, this file is *NOT* reloaded automatically when you use
# 'bundle exec jekyll serve'. If you change this file, please restart the server process.
#
# If you need help with YAML syntax, here are some quick references for you:
# https://learn-the-web.algonquindesign.ca/topics/markdown-yaml-cheat-sheet/#yaml
# https://learnxinyminutes.com/docs/yaml/
#
# Site settings
# These are used to personalize your new site. If you look in the HTML files,
# you will see them accessed via {{ site.title }}, {{ site.email }}, and so on.
# You can create any custom variable you would like, and they will be accessible
# in the templates via {{ site.myvariable }}.

# 指定网站的标题
title: Your awesome title
# 指定联系人邮箱地址
email: your-email@example.com
# 网站的简要描述
description: >- # this means to ignore newlines until "baseurl:"
  Write an awesome description for your new site here. You can edit this
  line in _config.yml. It will appear in your document head meta (for
  Google search results) and in your feed.xml site description.
# 站点的子目录，如果你的网站托管在子目录下，需要指定  
baseurl: "" # the subpath of your site, e.g. /blog
# 网站的基本 URL 地址
url: "" # the base hostname & protocol for your site, e.g. http://example.com
# 推特的用户名
twitter_username: jekyllrb
# github的用户名
github_username:  jekyll

# 指定要使用的 Jekyll 主题，如果不使用主题，则为空
theme: minima
# 列出要在站点构建过程中使用的插件
plugins:
  - jekyll-feed

# Exclude from processing.
# The following items will not be processed, by default.
# Any item listed under the `exclude:` key here will be automatically added to
# the internal "default list".
#
# Excluded items can be processed by explicitly listing the directories or
# their entries' file path in the `include:` list.
#
# exclude:
#   - .sass-cache/
#   - .jekyll-cache/
#   - gemfiles/
#   - Gemfile
#   - Gemfile.lock
#   - node_modules/
#   - vendor/bundle/
#   - vendor/cache/
#   - vendor/gems/
#   - vendor/ruby/
```

详细的参数，可以参考： https://jekyllrb.com/docs/configuration/.

## 二、快速搭建第一个Github Pages网站

在搭建前，默认已经注册成功了Github用户，现在开始根据官网教程一步一步的搭建。GithubPages的站点类型有几种：

1. **个人或组织站点（User or Organization sites）**：对于个人或组织站点，每个GitHub用户或组织只能有一个站点，它通常使用username.github.io或organizationname.github.io的格式，这是GitHub Pages的默认站点，通常用于个人网站、博客等。
2. **项目站点（Project sites）：**对于项目站点，每个GitHub仓库可以有一个关联的GitHub Pages站点，这意味着对于每个项目，您可以创建一个独立的GitHub Pages站点，无需限制。

下面参考[保姆级教程：从零构建GitHub Pages静态网站](https://blog.51cto.com/u_15294985/7978684)介绍如何搭建个人站点：

**Step1： 新建一个项目**

登录Github： https://github.com/，在顶部菜单栏点击“+”，然后“New repository”新建仓库，输入项目的相关信息，然后“Create repository”创建仓库：

![21000208_6532a4807911e93728](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241314292.png)

**Step2： 创建一个界面文件**

首先创建一个文件：

![21000208_6532a480a0a9623847](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241314762.png)

输入文件内容，点击提交：

![21000208_6532a480c462f8177](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241315651.png)

输入提交信息，点击提交:

![21000208_6532a480ee4a747098](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241315973.png)

**Step3： 访问**

大概等待几十秒，访问：https://用户名.github.io/，即可部署第一个属于自己的静态网站了，可以看到部署成功了。

在Github有了 `username.github.io`仓库后，我们进需要把Jekyll创建的项目与这个仓库关联起来，每次更新将本地文件推送到Github上，Github Pages就能自动生成网页！

## 三、静态网站模板——Chirpy

为了使我们的网站比较好看，网上有很多模板可以用，可以从如下网址获取模板：

+ [https://github.com/topics/jekyll-theme](https://github.com/topics/jekyll-theme)
+ [https://jekyllthemes.org/](https://jekyllthemes.org/)
+ [https://jekyllthemes.io/](https://jekyllthemes.io/)

我选择了Github上的[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy/)模板，其网页Demo如下：![截屏2024-07-24 13.30.13](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407241330803.png)

在其主页上有详细的部署教程，此处不在赘述。

### 1 个人定制

一些个人定制可以参考：https://huanyushi.github.io/posts/chirpy-blog-customization/

个人觉得原始网页的帖子显示不是很好看，于是修改一下使得帖子边框更明显，并且鼠标悬停在上面会有轻微移动效果。修改完的具体效果如下：

![截屏2024-07-25 16.46.11](https://aurora-pics.oss-cn-beijing.aliyuncs.com/Pic/202407251646884.png)

只需要在 `assets/css/jekyll-theme-chirpy.scss`文件中加入以下代码即可：

```scss
/* 覆盖主题的博客帖子边框样式 */
.card-wrapper.card {
  border: 3px solid #e3e5e7 !important; /* 使用更显眼的蓝色边框 */
  padding: 2px; /* 适中的内边距 */
  margin-bottom: 2px; /* 适中的下边距 */
  border-radius: 8px; /* 适中的圆角 */
  background-color: #f9f9f9; /* 淡灰色背景，增强边框的对比 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 轻微的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加平滑过渡效果 */
}

.card-wrapper.card:hover {
  transform: translateY(-5px); /* 鼠标悬停时轻微上移 */
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2); /* 增加阴影效果 */
}
```

其他效果的更改，结合ChatGPT也很方便。

## 四、WordPress迁移到Github

Github个人网站搭建好后，我需要把WordPress上的文章迁移过来，Jekyll有一个 `jekyll-import`包支持从各种其他网站迁移到Jekyll，超级方便！其中从WordPress迁移过来的说明文档链接为：https://import.jekyllrb.com/docs/wordpress/。我用的主要命令是：

```bash
jekyll-import wordpress \
  --dbname wordpress \ # 数据库名
  --user lhl \ #SQL用户名
  --password 密码 \
  --host 服务器公网地址 \
  --port 3306 \
  --table_prefix wp_
```

不过这个命令用的时候也有很多问题，利用ChatGPT可以一一解决，此处不再赘述。用这个命令成功的将原网站的文章全都迁移过来，至此，我的网站迁移计划大功告成！

## 参考资料

1. [保姆级教程：从零构建GitHub Pages静态网站](https://blog.51cto.com/u_15294985/7978684)
2. [Chirpy](https://chirpy.cotes.page/posts/write-a-new-post/)
3. [有哪些简洁明快的 Jekyll 模板？](https://www.zhihu.com/question/20223939/answer/3486773682)
