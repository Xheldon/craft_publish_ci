---
layout: post
date: 2021-12-09 00:28:30 +0800
categories: tech
header-style: text
tags:
    - Craft
    - 集成
    - 插件
path: _posts/tech/2021/2021-12-09-use-craft-extension-to-write-blog.md
title: 本文通过 Craft Extension 发送
sha: 8f2ca54c76f7dd13016056423a6cc28761687e1a
lastUpdateTime: 2022-02-28 12:51:48 +0800
---

> 本文所述的一些流程方案已经废弃，新的流程逻辑在这里：[https://www.xheldon.com/tech/my-blog-ci-in-2022.html](https://www.xheldon.com/tech/my-blog-ci-in-2022.html)

花了两天时间，简单搞定了在 Craft 写内容，然后通过自己写的插件将内容同步到 Github 仓库，然后 Github 仓库自动 build 出 Github Pages 的过程。

仓库地址： [https://github.com/craft-extension/craft-github-extension](https://github.com/craft-extension/craft-github-extension)

## 博客更新流程变化

### 之前的流程

VSCode 写完 → 提交到 x_blog_src 仓库 → 触发 Gihutb Action → build 后提交到 x_blog 仓库 → 成功

但是这个过程会有一些痛点：

1. 你可能不会一口气写完一篇文章，而是断断续续的写，但是你在公司电脑写了点后，需要先提交到 Github，然后再在家里的电脑接着写，这样的话一提交就会触发 Github Action。我的解决方案是，通过提交的 commit message 信息来判断，如果带有特定前缀的则 build，如果不带则忽略该次提交，但是总归是不太优雅。

2. 还有一种方案是先在 _draft 目录写，可以随便提交，写完后将文章挪到 _post 下即可，但是，就像刚才说的，依然不优雅。

3. 还有一种方式是，Jekyll 的 config 设置不显示未来的文章，也即，你可以在未完成文章的时候，在 meta 中写一个 2099 这种的日期，然后随便提交，Jekyll 不会 build 未来日期的文章，但是依然会触发 Github Action，然后更新文件，依然不优雅。

4. 有些时候，我贪图 Craft 的美色（颜值好看）和活好（随时随地编辑和多端同步），因此会现在 Craft 中写文章，然后写完后导出成 Markdown，然后手动将图片上传到图片仓库 x_blog-static，然后修改 Markdown 的图片引用链接，然后再将 Markdown 提交到 Github 仓库，过程非常长。

### 现在的流程

Craft 写完 → 提交到 x_blog_src 仓库→ 触发 Gihutb Action → build 后提交到 x_blog 仓库 → 成功

与之前的不同就是，从一开始在 VSCode 写，换成了直接在 Craft 中写，就如之前的方案第四点一样，既享用了 Craft 的美色，但是又少了期间同步到 Github 的麻烦事。除了图片（下面有专门说图片的事情）外，单独同步文档是非常完美的方案。因此我以后可能会比较频繁的更新博客了（之前写的慢有很大一部分原因就是，过程太复杂了），能将注意力更多的放到内容上，棒！

## 说明

使用上有以下设定：

1. 本插件目前仅供个人使用，因此有些配置是个性化写死的，比如只支持将文件往 `_posts` 目录下传，如果用户比较多的话，会考虑花更多时间做的更通用写，目前只有自己用，就不那么讲究了。

2. 需要 [Github Personal Token](https://github.com/settings/tokens/new)，来通过 Github 的 Rest API 将 Markdown 内容同步到 指定的 Github 仓库。

3. Github API 在将内容发送到仓库的时候，会对比源仓库和现有仓库的内容 sha 值，如果完全相同，则被更新的文件不会显示 commit 信息，而查看 commit 信息的时候，显示的是 0 files changes。

4. 文章第一个 block 一定是一个两列的 table 来作为 Jekyll 的 meta 信息，目前 meta 信息是除了 path 之外的全部内容。

5. 文章 title 即为博客文章 title，不用写在  meta 中。

6. 截止 2021 年 12 月 9 日，实测使用 Craft 提供的 API `craftBlockToMarkdown` 输出的 Markdown ，未能输出文档里面的 Blockquote 样式（Craft Block 中叫 Decoration 中的 Focus ，[官方称是 bug](https://forum.developer.craft.do/t/wrong-render-of-markdown-with-decoration-focus-and-image-question/235/6)，会在随后的版本修复。如果想生成自定义的 Markdown 需要自己遍历 Block），其他未做测试。

7. 目前插件中的配置项不那么人性化，等后续优化。

8. Craft 中的 Markdown 排版是比较好看的，比如你可以在 list 下面嵌入一个 paragraph 或者 image，以保证与 list 的内容对其，但是普通 Markdown 不支持这么做，因此排版上，输出的样式会比较难看。

9. meta 如果含有多行信息，如 tags 这种的，则可以用 `-:` 分割，如 `-:测试-:服务器` 。

10. Craft 的 Markdown 的 API 建议使用 `common` 格式（默认，目前本插件不可配置），如果使用 `bear` 格式，则其内的图片前面不会有 `!` 导致 Github 将其识别成链接，而不是图片。

11. 有些 Craft 的功能如「深度 Markdown 链接」，并不是标准 Markdown 的语法，因此我这里没有测试支不支持。

12. 官方说明是，storageApi 在 Web 端是不加密的，存储的时候要提醒用户注意，见 [这里](https://documentation.developer.craft.do/extensions/craft-api/storageapi)。Mac 则无此问题。~~分析发现 Web 中的 storageApi 存在了 SessionStorage 中~~，后来再看，改成位于 IndexedDB 中了（毕竟是开发者预览版，改的真快...），一个叫 `plugindata-storage` 的 DB 中。而 Mac 端，因为我切换了用户工作空间，Storage 也没了，[反馈了下](https://forum.developer.craft.do/t/wrong-render-of-markdown-with-decoration-focus-and-image-question/235)，官方目前还未回复 :-(。

13. Mac 的 storageApi 存在竞态问题，因此如果你一开始刚加载的时候就使用 storageApi 读取数据的话，是读取不上的，因此我在插件中处理的逻辑是，如果是 Mac 则延迟 3s 初始化插件内容，Web 则无此限制。

14. 更多配置支持中...

## 关于图片的问题

1. 无论是 Web 还是端，上传到 Craft 的图片，在 Web 端显示的时候，检查元素查看，一定是 `.jpg` 格式的，但是使用 Craft 的 Markdown API 生成后，~~变成了 ~~~~`.png`~~~~ 格式的~~，此处有误解，图片的后缀名还是跟上传时候的格式有关系，Craft 不会给你转换格式。

2. 虽然文档中检查元素时显示的图片地址域名是 `res.craft.do` 且在 Github 仓库中查看源文件时，显示的也是这个地址，但是，在 Github 中预览图片，也即直接点击仓库 md 文件打开的时候，却是 `https://camo.githubusercontent.com `  这个地址，本来还以为 Github 会好心的把你的 md 图片转存到它的服务器上，其实只是 Github 为了安全起见，在渲染第三方图片的时候，给你临时转存了一下而已。

3. 如果不依赖服务端，你在 Craft 中上传的图片，在通过 Craft API 获取的时候，是无法通过前端的 `fetch` 等方法获取的，会提示你 CORS 错误，因此你如果想在文章上传到 Github 的时候，将文章里面的图片摘出来上传到自己的图床/COS/Github 仓库，纯前端是做不到的，你需要使用服务端拉取该图片后转存。 同时，Craft  imageBlock 图片地址位于 AWS 的 S3，国内服务器如腾讯云拉取可能会超时或者比较慢，但是国外的服务器往国内推的时候好像速度还 OK，所以建议使用 AWS 的服务转存图片（更新：目前我用了 Vercel，具体看 [这篇文章](https://www.xheldon.com/tech/my-blog-ci-in-2022.html)）。

---

此处放一个图片，测试下速度：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/5e3fe16f-07e2-4cbd-ace8-ad4d882ac82d/F2F19143-AA3B-4849-9979-31FB8DC06FF0_2/3.jpeg.jpeg)

## 更多

1. 计划写一个模板的插件，地址在：[https://github.com/craft-extension/craft-template-extension](https://github.com/craft-extension/craft-template-extension)

2. 所有插件均基于这个工具开发：[https://github.com/craft-extension/craft-dev-toolkit](https://github.com/craft-extension/craft-dev-toolkit) 在官方示例的基础上增加了一些配置如 UI 使用 antd 等，后续如果有用户我会考虑增加更多配置，如支持脚手架生成插件开发环境等。

3. 更多插件敬请期待...

## 2022.01.24 更新

关于图片的问题，有个想法是不将图片在 Github 备份了（毕竟在 Craft 中的图片就相当于备份了），直接传到腾讯云 COS。但是，因为腾讯云 COS 需要发送请求，而其使用的请求方法是 request 库，且对其做了一层封装，以添加相应的签名等信息。查看了下 COS 的源码，发现其可以对请求工具进行配置，于是我目前有两种途径实现目的： 

1. 重写 COS 用到的 request 库的方法。

2. 重写 COS 中的请求代码。

3. 自己按照文档中告诉的示例，构造签名以进行请求。

显而易见，最终使用了第三种办法，因为简单。

## 2022.02.28 更新

01.24 的方案废弃，成本太高。最终方案是不将图片传到 Github 了，直接通过 Vercel 的服务转存在腾讯云，至此解决了图片的问题，可以愉快的使用 Craft 写文章了。