---
layout: post
date: 2022-02-23 15:55:30 +0800
categories: tech
path: _posts/tech/2022/2022-02-23-my-blog-ci-in-2022.md
cos: 2022/my-blog-ci-in-2022
header-style: text
tags:
    - 集成
    - 插件
    - Craft
    - CI
    - 技术
callout: 技术在进步，我也在折腾。
craft: https://www.craft.do/s/zGU3Z3SIIVMahv
title: 2022年我的博客自动化流程
sha: 5c9ec3d99c5bd2383ab9a03ebecdc498abd20c4b
lastUpdateTime: 2022-03-03 09:07:42 +0800
---

## 前言

2021 年的时候，写了一个篇 [关于博客自动化](https://www.xheldon.com/tech/my-blog-ci.html) 的文章，但是当时没有处理好 Craft 图片的问题，而且逻辑分散到多个仓库，不具有可参考性。在那之后验证了一下直接从 Craft 传图的可行性（答案是不行），于是最近花了一个周末搞定了一下图片转存到腾讯云的问题，加上换到了 Vercel 而不是用 Github Pages，速度变快了不少，遂记录如下。

注：可能后续还会有诸如「202x年我的博客自动化流程」之类的文章，毕竟技术在迭代，时代在进步，我也在折腾 🤣

## 正文

### 总体流程

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/E364BCE7-911F-4F16-A9CF-B7426702C58B/90EA02AD-FA01-4A53-A717-87F5374DA22F_2/VB3iKTgzZbcTPHGyWmaBZMRL7CVwAje36jsHZVCzFJAz/Image.png)



### 详细解释

#### ⓵ Craft 文档

指的是按特定格式写的博客文档，特定格式是指，需要满足以下条件，才能正确同步到仓库： 

1. 文档的第一个元素是包含 meta 信息的 table元素。

2. meta 信息中，title 不用写，我直接从文档数据中获取，header-img 和 img 的版权信息（如果是从 unsplash 上传的）也不用写。

3. 不支持 Drawing 元素（因为它无法生成有效图片后缀名的文件），如果存在的话不会上传到 COS，会无法正常展示（因为它是 Craft 的私有文件类型） 。

#### ⓶ Craft 插件仓库（公开）

指的是应用于 Craft 的插件，用来获取 Craft 文档内容，以将内容处理后上传到仓库。关于 Craft 插件的更多信息在 [这里](https://developer.craft.do/)，关于我写的这个私有插件的地址在 [这里](https://github.com/craft-extension/craft-github-extension)。

插件的作用是将 Craft 的文档内容，生成 Markdown 格式的文档，然后使用 Github REST API 发送到**固定的**仓库位置，即 craft_publish_ci 仓库的 content.md 文件，如果该文件存在则会替换其内容，仓库地址公开，在 [这里](https://github.com/Xheldon/craft_publish_ci)。

#### ⓷ craft_publish_ci 仓库（公开）

此仓库主要使用 Github Action 来处理图片，接收到来自插件的内容之后（也即是 content.md 文件更新后），读取该文件的内容，将 Markdown 文件中的图片（以 `![` 开头的块级元素被判定为图片，以及特殊的 header-img 开头的头图）get 到之后转存在腾讯云 COS 中。其中，为了统一和方便，我拿到图片后会在 action 中统一转成 jpg 格式的，这样也好处理如果没有图片需要上传（仅修改文本）的时候，直接替换文档中图片地址的逻辑，因为有些图片后缀不是常用的图片格式如 png jpg，甚至没有后缀名等。我曾经尝试使用拉取图片的响应 content-type 来给图片添加后缀名，但是发现有些图片是 tiff 格式的，content-type 返回的是 application/octce-stream（没拼错的话），而且这个方案需要先**全部**拉取文档中的图片，怕被 ban，于是先将需要上传的都转成 jpg。然后拿到 CDN 地址后，将文档中对应的图片地址替换成 CDN 图片地址。完成之后再将文件内容发送到真正的博客仓库，也即 x_blog_src。

#### ⓸ x_blog_src 仓库（私有）

此仓库接收到 push 更新后，执行 Action，build 出 HTML 文件，发送到博客公开仓库 x_blog，这么做的原因，详见 [这里](https://www.xheldon.com/tech/the-using-of-github-pages.html#:~:text=%E6%88%91%E7%9A%84%E5%8D%9A%E5%AE%A2%E4%B9%8B%E5%89%8D%E6%98%AF%E7%9B%B4%E6%8E%A5%E5%9C%A8%E6%BA%90%E7%A0%81%E6%94%BE%E5%9C%A8%20repo%20%E4%B8%AD%EF%BC%8C%E4%BD%BF%E7%94%A8%20Github%20Pages%20%E6%8F%90%E4%BE%9B%E7%9A%84%E9%BB%98%E8%AE%A4%E7%9A%84%20Jekyll%EF%BC%8C%E7%84%B6%E5%90%8E%E8%AE%BE%E7%BD%AE%E8%87%AA%E5%AE%9A%E4%B9%89%E5%9F%9F%E5%90%8D%E3%80%82%E4%BD%86%E6%98%AF%E8%BF%99%E6%A0%B7%E6%9C%89%E4%BB%A5%E4%B8%8B%E5%87%A0%E4%B8%AA%E9%97%AE%E9%A2%98%EF%BC%9A)。

#### ⓹ x_blog 仓库（公开）

[此仓库](https://github.com/Xheldon/x_blog) 授权给 Vercel 读取其内容，然后部署。绑定了自定义域名，因此可以通过访问 www.xheldon.com 来访问。不使用 Github Pages 的原因是前者更专业，且有专门的全球 CDN 加速，而 Github Pages 一个是域名解析慢，一个是没有 CDN 加速，做个文档网站还好，做个博客没有任何优化感觉不合适。

### 其他细节

博客中存在异步请求 Notion 数据源的页面，如 [订阅管理](https://www.xheldon.com/subscribe/) 页面，该过程同样是使用 Vercel 的 serverless，在服务端请求 Notion 的 database 做一层转发，这个接口我做成通用的了，使用 POST 发送 Notion database 的 表头 和 databaseId，方便我自己后续有更多的页面需要异步请求 Notion 的情况。