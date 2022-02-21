---
layout: post
date: 2022-02-21 14:38:10 +0800
path: _posts/tech/2022/2022-02-21-test-image-upload-to-tencent-cos.md
cos: 2022/test-image-upload-to-tencent-cos
categories: tech
header-style: text
callout: 本文章用来测试图片同步逻辑，没有任何实质意义。
craft: https://www.craft.do/s/Uxrk7BKPI5n6vD
tags:
    - 技术
    - 测试
    - 集成
    - Craft
    - 插件
title: 【请忽略】测试图片资源同步到腾讯云 COS 的文章
---

## 前言

花了一个周末，搞定了发布 Craft 到 Github 的同时，将图片传到腾讯云 COS 的过程，这里做个测试。

图片一： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/04849A4D-455F-4549-9030-53EF2C142669/BA53A2CE-2989-47E1-A19A-B49A6A2FEA8F_2/OPL2yAID6f5zbfGGYKNVTwm8OD3Kq2XijLRsFPQ0pCcz/181645238369_.pic.jpeg)

图片二：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/04849A4D-455F-4549-9030-53EF2C142669/C793E3FD-C0AC-4932-99F9-D6D5A84B84E1_2/yrlfUHhaKahGCFOOMo4WpxjkIp8TpLeimZNMOZuZFogz/191645238369_.pic.jpeg)

图片三：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/04849A4D-455F-4549-9030-53EF2C142669/2ECF0559-F2FE-439F-8C30-8DDF77D5215C_2/hipqN2Aroyb72WGvNvBw4FSjlv3eB99SzLB6DyRCz44z/201645238370_.pic.jpeg)

DONE！
相关仓库在：[https://github.com/Xheldon/craft_publish_ci](https://github.com/Xheldon/craft_publish_ci)  和 Craft 的插件：[https://github.com/craft-extension/craft-github-extension](https://github.com/craft-extension/craft-github-extension)

CI 的主要逻辑位于 publish，需要配置一下 Github Action，注意看 .github/workflows 中的配置即可。

插件的逻辑比较简单，只是拿输入的 Github Token，然后将内容发到 CI 仓库中。

项目主要是个人自用，一点通用性也没有，可以 Fork 后拿去修改一下，不谢。

