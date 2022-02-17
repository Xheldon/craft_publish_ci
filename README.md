
# 警告

本仓库用来自用，用来在 Craft 中写的内容含有图片的时候，先拉取图片然后上传到腾讯遇云 COS，然后再将腾讯 CDN 的地址替换掉 Craft 的图片地址后，更新到 Github。

你要是喜欢可以自己拿去定制，如果有什么疑问可以加这个电报群，友情指导一下: https://t.me/xheldon_tech

## 本仓库的作用

1. 将在 Craft 中写的文档，内容同步到 Github Pages（我的地址是 x_blog_src 仓库，你可以 fork 后自己修改）。
2. 将在 Craft 中写的文档中的图片，同步到腾讯云 COS（你可以自己配置相关 Github Action 的环境变量）。

## 使用方法

1. 访问这个地方，fork [这个仓库](https://github.com/craft-extension/craft-github-extension)，将其中的本仓库的地址，改成你自己的仓库
2. 拉取上面这个仓库后，安装依赖，然后 build 出一个 .craft 后缀的文件，就是你本人定制的 craft 插件。

## 后续计划

1. 更通用。
2. 将 ci 仓库和 craft 插件仓库合并。
3. 其他想到的随时加。

## 许可

禁止商用。使用需要署我的名字。商用付费。个人随便用。