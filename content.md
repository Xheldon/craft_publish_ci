---
layout: post
date: 2022-04-24 00:57:15 +0800
categories: life
path: _posts/life/2022/2022-04-24-the-way-to-watching-tv.md
cos: 2022/the-way-to-watching-tv
header-mask: 0.4
tags:
    - 生活
    - Apple
    - 折腾
    - 软路由
    - 自由
craft: https://www.craft.do/s/zRTAMsyWRqPewN
callout: 为家人实现观影自由，也是一种幸福。
title: 我的家庭观影之路
header-img: https://images.unsplash.com/photo-1440404653325-ab127d49abc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNDIyNzR8MHwxfHNlYXJjaHw1fHxXYXRjaGluZyUyME1vdmllfGVufDB8fHx8MTY1MDUwNDcwMw&ixlib=rb-1.2.1&q=80&w=1080
header-img-credit: Noom Peerapong / Unsplash
header-img-credit-href: https://unsplash.com/@imnoom?utm_source=xheldon_blog&utm_medium=referral
sha: 1933b02b4d685cf2366c47e397dd98f7be57c380
lastUpdateTime: 2022-04-24 09:42:49 +0800
---

## 前言

看电视是家里必不可少的娱乐活动，但是如何舒服的看自己想看的内容却不是一件简单的事，有时候甚至有钱都买不来舒心，于是此处记录一下有关家庭观影的折腾记录，一来可以给大家一个思路，二来可以帮助大家提高生活质量。

## 我的基本情况

这里先介绍一下我的基本情况，如果情况和你相符的话可以继续看下去；如果与你的需求不甚吻合，也可以继续看下去做个参考。

### 设备

- 索尼 65X90J 电视作为播放设备，京东 618 买的。

- Apple TV 4K 2021 款作为附属播放设备，京东国际买的。

- 联通宽带送的普通 ZTE WiFi6 路由器作为主路由。

- NanoPi R4S 作为[软路由](https://baike.baidu.com/item/%E8%BD%AF%E8%B7%AF%E7%94%B1/4824918)，淘宝买的。

- [Infuse Pro 订阅](https://firecore.com/infuse) 软件做为播放客户端，Apple 美区买的。

- 联通宽带作为基础设施。

> 注：我的 R4S 的连接方式是 [旁路由](https://sspai.com/post/59708) 方式，这样家里一些无需特殊上网的设备就不会异常，比如家里的 360监控摄像头、华为智能灯、小米晾衣架、小天鹅智能洗衣机等，这些智障硬件在家里网络特殊的情况下，无法连接网络，尤其是 360监控摄像头。因此这些设备必须直连，所以只能使用旁路由的方式，大部分的设备默认走直连，少部分设备特殊配置后走特殊网络即可。

### 需求

1. 吃饭的时候看央视新闻等电视直播。

2. 看老旧的美剧、英剧如《老友记》、《权利的游戏》，对新出的美剧不感兴趣，不追剧。

3. 看会被阿里网盘和百度网盘和谐的电影/电视剧，比如当下正在影院放映的电影、流媒体正在热播的电视剧、爱国敬业诚信友善的电影等。

4. 无聊的时候就想听个响，随便放点动画什么的如《猫和老鼠》、《哆啦A梦》、《蜡笔小新》等每集独立的电视节目等。

5. 看一些蓝光画质的纪录片。

6. 流畅播放不能卡。

7. 设置一次之后，后续不需要再操心，喜欢稳定和一劳永逸。

8. 不想到处找资源下载电影/电视剧，又怕电脑下载迅雷等 BT 下载，会对 SSD 固态硬盘有损害。

9. 对电脑软件有洁癖，能不装尽量不装新软件，如果一个软件能解决的，不会装两个；即使装软件，也尽可能的不影响电脑的环境（此处特指从 Github 上下载的软件），因此优先考虑 [Docker](https://www.docker.com/get-started/#) 安装。

> 注：有些人喜欢自动化，比如使用 Sonarr + Jackett + qBittorrent ，设置好之后就可以实现自动追剧，即剧集有更新后自动下载，全程不用手动，但是我的需求没这么强烈，因为我看的大多数剧集大多数都是能通过阿里云盘转存看的国内的剧集，比如一些CCTV 的纪录片和常见的国外剧集如一些 BBC 的纪录片、老友记之类的。因此我没有使用此自动化方案，一来是因为需要额外购买大容量硬盘，二来是因为我主力看电影途径还是通过阿里云盘进行的。

## 前期的无效折腾

想了想，为了避免大家少走弯路，这里还是放上我走过的弯路，给大家个经验教训。如果对此不感兴趣，直接跳到下一节即可。

### Emby

一开始的时候，鉴于画面优美性、配置简便性，我想使用 [Emby 服务](https://post.smzdm.com/p/735222/)，但是市面上的公共的、收费的此类服务，要么是需要特定方式连接，要么是需要特定方式使用（如定时签到、按时回答问题等），最头痛的是此类服务的速度非常差，尤其是看那种蓝光高清的电影，动不动 20G+ 容量起步的时候；或者是晚上观看高峰期，服务质量会非常恶劣。再加上其他的问题如 infuse 客户端会进行扫库操作（当然这个不是 Emby 的锅），因此在我 [折腾了一次](https://www.xheldon.com/life/apple-tv-using-and-problem.html#:~:text=infuse%20%E9%A6%96%E6%AC%A1%E4%BD%BF%E7%94%A8%E6%97%B6%EF%BC%8C%E7%99%BB%E9%99%86%E5%AE%8C%20Emby%20%E6%9C%8D%E5%8A%A1%E5%90%8E) 之后就放弃了此种方案。

### IPTV

想观看一些各个地方的电视台的直播，于是想到可以使用 [IPTV](https://baike.baidu.com/item/iptv/113036)，一般办宽带时候，运营商会有介绍其各自提供的 IPTV 服务，只是运营商的需要额外收费，我用的是免费的。如何免费呢？首先需要下载一个客户端，我用的是 iPlay TV for Apple TV，5.99 美元。然后在 Github 上搜一些直播源的地址填进去（页面 README 会有些怎么使用这些地址），这些地址都是好心人从网络上抓取的运营商的 IPTV 地址。

但是这个方案的坏处是，直播源是不稳定的，时不时的你就需要手动更新地址，或者地址里面的某个播放源就无效了，经历过几次之后就很头痛，于是后续的看央视直播，我都是要么手机投屏，要么就是用安卓电视安装的 新视听 app 看央视直播。

## 当前方案

> 注意，下面的所有设置的基础的前提是，家里的设备如 Apple TV、 R4S 、Mac 都在同一个网段，否则无法相互识别。我目前的网段地址是 `192.168.7.x` ，比如 R4S 位于 `192.168.7.2` 主路由位于 `192.168.7.1` ，从一个路由出来的都是在同一个网段，因此此处无需特别关心，此处只是提醒一下，如果总是设置不对，可能有这方面的原因。

1. 配合 R4S，通过阿里云盘提供的[ WebDAV 协议](https://baike.baidu.com/item/WebDAV/4610909?fr=aladdin)，使用 Infuse 进行电影观看，只需要网上搜索想看的电影名 + 阿里云盘 转存即可，高阶一点的，电视剧的话搜 电视剧名 + 阿里云盘 + 刮削（意即整理好剧集名和海报、演员表、每季的海报介绍等各种信息了，可以直接在 Infuse 上以电视剧的形式查看）。

2. 配合 R4S，通过 qBittorrent 配合 Jackett 搜索插件和软路由的外接硬盘，实现将电影下载到外接硬盘上观看，这样也不会损害电脑的 SSD，同时也不用在电脑上多下一个软件等，此途径是为了弥补上面阿里云盘因为一些原因而被和谐的电影的一种方案。 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/869A0533-9AE7-463E-9664-D9A61AD17D47_2/Z2TVyLvW5v33yKkjRrUyYy0edYo67LuIgNwGYkh7xqgz/Image)

## 具体实践

> 下面说的全部 R4S 软路由的插件，都是购买的时候商家已经给刷好的系统，可以让商家帮忙刷，无需自己手动安装。

### 阿里云盘

使用 R4S 的阿里云盘插件 `阿里云盘 WebDAV` ，[项目地址](https://github.com/messense/aliyundrive-webdav)：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/FAD4964F-C3B3-4DA1-8E22-59CC9F206DE8_2/ZcgcA4ZcNsky3KN42X2ZkjGnoBzrLS7E5fieiVTi7rUz/Image)

插件装好后非常简单配置一下即可，主要是两个配置，一个是 `Refresh Token` 这个需要使用 Chrome 手动打开阿里云盘的 Web 页面，按 `cmd` + `opt` + `i` 打开控制台，然后在 `Application` Tab 中，点击左侧的 `Local Storage` 查找 `token` 这个键，在下方的值中找到 `refresh_token` 的值，粘贴到上图中即可： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/A081D0DA-BD8E-4440-8E88-304941A8182C_2/seCyxp685o0FIwJ3BzmcjXNNtYi799tLyVSxR796Y3Iz/Image)

端口的话，就随便写一个不会冲突的即可，然后勾选 `启用` 后，点击右下方的保存并应用，即配置完毕，此时你可以直接使用浏览器访问（假设家里路由器地址是 `192.168.7.2` ）： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/C09F1F1F-4743-4F33-8400-36E0E237814F_2/MwTwcP968ZyrLe3likF00omZ9AOZyq0yLw3nyVNdyK8z/Image)

然后再在 `Infuse`  中配置，让其识别到局域网的这个 WebDAV 服务即可，操作如下，进入设置-网络-共享-添加共享： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/61069572-196F-4874-8122-BAD70096CE68_2/dUxGr7C2ZZ8Vyjxa2vCEjfnxtQUDuss4hf5Ovd5vhEYz/Image)

位址就是刚刚的局域网 ip 地址，下方高级中填写端口。然后进入设置-媒体库，把阿里云盘中的文件夹都打上勾，这样就可以在首页看到文件夹了，记住，每次如果有文件删除和新增，如果想及时看到的话，都需要执行一次打勾/取消打勾的操作： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/C12D97E3-66AB-41F5-B1CF-559752C3B721_2/03XR5sdHXZmRfJOpFMD1HRgqcxceEexMwdPEyUdUI5Qz/Image)

首页视图： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/939E8E46-8850-4713-B536-1A7625121CCC_2/D5qatayYcjjTivSkPctddyJy4upxolYEDtH9S3IqugQz/Image)

其他 Infuse 的使用可以自己发掘一下。

### qBittorrent

有时候阿里云盘因为一些众所周知的原因，部分资源会被和谐掉，因此为了下载一些热门剧，或者下载国外的一些剧集的话，只能采用此种方法。

[qBittorrent](https://baike.baidu.com/item/qbittorrent/9179482) 支持磁力下载和 BT 下载，可以直接在电脑上安装此软件，但是 BT 下载对 SSD 是有损伤的，我不想直接在新买的 Mac Studio 上使用，于是就将其放到软路由上，然后在 R4S 挂载外接硬盘使用。需要配置一下，才能在路由器上使用此软件，过程如下： 

#### 挂载外接硬盘

家里有一个大学时期买的 500G 的机械硬盘（磁盘分区类型建议是 [exFAT](https://baike.baidu.com/item/exFAT)，Mac 的 APFS 不被识别，可以使用 Mac 的磁盘管理工具进行格式化），一直放在抽屉吃灰，于是拿来用了。硬盘直接插到 R4S 上可以识别，但是需要挂载，这是个 [计算机概念](https://baike.baidu.com/item/%E6%8C%82%E8%BD%BD)，就好比是对软路由来说，有一个外接的硬件通过通用协议 USB 接入到系统中，但是并不知道接入后要如何对待这个硬件。因此此处外接硬盘后，软路由会显示一个挂载点虚拟挂载点（下方的 `/dev/sda` ），表示这个硬盘挂载到路由系统的这个路径下，然后你需要配置一下要将该挂载点映射到实际位于 `/mnt/` 物理挂载点的哪个路径，才能正确访问该路径下的该外接硬盘设备。

进入到 `系统-磁盘管理` ，可以看到已经设备了外接硬盘（红框指示的地方），这时需要点下方的`挂载点` 然后添加该设备即可： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/7EEFE44B-F57F-4FC9-AF8A-FEB0D88B90A1_2/cQOfaJzYMgyCAZU1roiu29A4mniduSeDvoc8RlJwy6Yz/SCR-20220419-w94.png)

进入到 `系统-挂载点` ，如图可以看到下方有个 `挂载点` ：

> 图中我是已经挂载了，所以会有第一个红框，默认是没有的，你在下方的挂载点添加后即可在上面的 `已挂载的文件系统` 中看到。 注：Linux 外接设备挂载的路径一般都是位于 /mnt 下的，添加后注意看容量是否是外接硬盘的容量即可。因为分区的原因，虚拟挂载点 `/dev/sda` 下可以挂载的物理硬盘有两个，一个是 `/mnt/sda1` 只有几百 M，一个是 `/mnt/sda2` 才是真正的可读写硬盘。

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/54303E2E-02EC-4EFA-8156-3356B8E458AD_2/owFTkz2zZk78KyWxGCLwnP4RzmWCfEJPHef9OqwQxlAz/SCR-20220419-wba.png)

之后如果你使用的是 Mac，就可以直接在 Finder 的 网络中发现该设备了，因为 R4S 默认带了一个 SMB 共享的程序，即下面说的配置，如果你想更定制一点，可以修改该共享配置（不过在 R4S 中你能修改的也只有名称了）

#### 配置 Samba 共享

> 此处先配置路由器的[ Samba 共享](https://baike.baidu.com/item/samba/455025)（也即 SMB 协议）的原因是，这样的话就不用使用 SSH 终端登陆路由器来通过命令行修改配置文件了，对小白比较友好，因此将这一步放到首位。

浏览器进入到路由器配置页面，然后进入 `网络存储-网络共享` ， 进行如下填写，其中主机名是显示在 Finder 中的名字，描述和工作组默认就可以，可以看到默认状态下 `自动共享` 选项是打开的，也就是我上一节说的这一步其实不是很需要。但是如果默认自动共享的话，是共享的根目录，会将 `/mnt/sda1` 也显示出来，我这个强迫症一定要改掉，于是配置下方的 `共享目录` 即可： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/7C7C0A2E-520C-4B00-9374-36214F11E288_2/heK4MLC0ePxlaoyDvMNuGqcNacCw9C1y7a6WV7EnuZMz/SCR-20220419-w73.png)

此处需要注意的是，需要配置一下本页面的第二个 Tab，即 `编辑模板` 然后将需要使用密码和 security 共享类型为 User 的配置改成不需要使用密码和共享类型是 Share 即允许匿名连接，否则需要输入账号密码，麻烦： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/79FA04AC-4689-412A-8C81-EBE17EF8A0D8_2/SSC7ohx7OR1KNuar9joscwUFBF1Zraht5tpvLdPu1pwz/SCR-20220419-w6i.png)

然后点击右下角的 `保存并应用` 即可。

做完以后，直接在 Mac 中的 Finder-网络 就可以看到： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/AD4BFF23-BC65-4601-B44B-DEAB0D0E27C6_2/yYjMbNk61zMy0kgmS5d7eKeeojimRpWJqEVQJ4buBBYz/Image)

也可以手动连接服务器，如图： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/F81F6D6A-210E-41E4-84A5-BE6F7828E555_2/oqRTeZeu7xqOSCulkcWhktyWKNdL3LVugdk7B3PyVjUz/SCR-20220419-wcv.png)

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/7CF3B88C-09B8-42F8-96ED-FCDE506F539A_2/hcLNHVoGbA6LZBxpybbsnARr8ZAnx6rJFexoMxWirdQz/Image)

#### 配置 qBittorrent

进入软路由 `网络存储-qBittorrent` 插件中，根据上面的挂载点和挂载目录为 `/mnt/sda2/` 按如下配置即可： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/A1529EB2-17DE-4825-8DB5-8EC285616B16_2/FunUGixxgUfpveVDJ7rPxwLvFlOd0dCFkIj1O8UxfCIz/SCR-20220419-wdl.png)

主要配置的是 配置文件存放路径 和 下载文件存放目录，改成外接硬盘的地址 `/mnt/sda2` 下面的路径即可（上图中是已经启动后的界面，未启动的话不会有 「打开 Web 页面」和「qBittorrent 运行中」的提示）。设置完成后点击保存，先不要应用，然后进入到`下载设置` tab中，将`启用临时目录` 选项关闭，否则会产生大量的临时文件： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/C64A0BF2-23FB-4F40-AB39-9757904C1010_2/isHf3YCSs6vT2S8UcmtzzOJd1WxKaArA64FzN7sdHtAz/SCR-20220419-wdu.png)

然后点击保存并应用即可。

之后，进入到 qBittorrent 的 Web 管理界面，即路由器地址+刚刚设置的端口号 `192.168.7.2:9091` ：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/5C47B593-D0D6-4B0D-BFAE-3B2CF21FAB32_2/FlwOFmkffDeJngwjfBRALe5fqTAFrKdtfISrWgvfs7wz/Image)

至此就安装完成了，你有什么网上搜到的磁力链接或者 torrent 种子都可以进行下载。

> 如果你还是不想到处找种子，或者说网上搜到的磁力链接都是死链，无法下载，那么继续看下面。

#### 设置 qBittorrent 的 Jackett 搜索插件

该插件可以直接在 qBittorrent 中调用 Jackett 服务搜索资源然后右键下载，如下： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/D10C0DCC-31AB-405D-B7E9-8FEA68D23414_2/kVaAlnTKnQAm2GEIby8dFPcDmzZxWiOJpBo8N8CDYqQz/Image)

但是这并不是默认配置（好像如果直接下载 qBittorrent 的 Win 或者 Mac 客户端，Jackett 搜索插件是默认启用的，但是路由器没有带任何默认插件），需要单独安装，步骤如下，直接看图： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/0C025BE5-98C1-4260-9F38-C0AB79199FD5_2/5xN3KvokNEvyUswjZyUoxxyUYdTZeDDkCpHSqmkeVY4z/Image)

点击安装新插件后，会让你输入一个地址，该地址可以从 [这里获取](https://github.com/qbittorrent/search-plugins/wiki/How-to-configure-Jackett-plugin) ，或者直接填写这个地址也行，都一样： https://raw.githubusercontent.com/qbittorrent/search-plugins/master/nova3/engines/jackett.py

之后就会在已安装的搜索插件中出现该插件的列表。

> 注：上述安装只是安装了 qBittorrent 的 Jackett 插件，以让 qBittorrent 配合 Jackett 使用，好比是 Safari 安装了迅雷插件一样，此时还不能使用，还要安装迅雷软件本身，Jackett 插件也是一样，只装插件是不行的，还要装 Jackett 服务才行。

#### 安装 Jackett 服务

在路由器上直接装 Jackett 这一步我没搞定，总是报错，应该是缺少某个环境配置，最后也不想搞了，因为我会使用 [Docker](https://baike.baidu.com/item/Docker) 在 Mac 本地，因此我将这一步放到了 Mac 本地，只需要配置一下 qBittorrent 的 Jackett 插件即可。

Docker 可以在官网[ 这里下载](https://www.docker.com/get-started/#)，下载后可以在终端命令行输入 `docker` 测试是否环境变量安装成功。

在 Docker 中安装 Jackett 很简单，步骤在官方的 [这个地方](https://github.com/Jackett/Jackett#installation-using-docker)，这里简述一下即可：

打开终端，复制在官方的安装步骤中的 docker cli 代码： 

```
docker run -d \
  --name=jackett \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e AUTO_UPDATE=true `#optional` \
  -p 9117:9117 \
  -v <本地硬盘路径（去掉本句左右两侧尖括号）>:/config \
  -v <本地硬盘路径（去掉本句左右两侧尖括号）>:/downloads \
  --restart unless-stopped \
  lscr.io/linuxserver/jackett
```

比如上面的配置，我的本地硬盘路径就是 `~/Code/Docker/config` 和 `~/Code/Docker/downloads` 。这个配置简单解释一下就是，映射本机端口 9117 到 Docker 容器的 9117 端口，启用自动更新，禁止重启停止除非已经意外停止。

之后就可以在 Docker 中看到这个服务了（默认直接启动了）： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/5CD0C81A-15D4-46F6-B174-C158A782675D_2/fyULDhnqCQDyPFIJBNjfUbBmlMHlHYDhgY7nITaWFhsz/Image)

然后在浏览器访问该地址： `127.0.0.1:9117` （或者如下图访问本机局域网 ip 也行，是一样的）即可看到 Jackett 的 Web 配置页面： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/6DAB50B8-BBFC-442C-A707-D7E2E542808E_2/itXN2MdhxSW0O9hxnSGxKQpUa7zpxgaCjCGgWZHn7kYz/Image)

这里记住这个 API Key，下一步会用到，接下来配置 qBittorrent 中的 Jackett。

因为 Jackett 是安装在本地的，因此如果想让安装在路由器的 qBittorrent 的插件能够访问安装在本地的 Jackett，需要知道本机的局域网 ip，可以在系统设置中查看： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/13072C1C-51B3-4AA2-94AA-7F6380094D6A_2/4x5FrNQcnrk2c7oJrA2Q3QRXbSsA4W6VdGom1ukAsZoz/Image)

之后，在 Finder 中打开 qBittorrent 的配置目录（还记得刚才设置 qBittorrent 的配置目录吗？我们存放在了软路由外接硬盘中），Finder 路径是 `config/qBittorrent/data/nova3/engines/jackett.json`设置该地址和端口： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/7B4A1D7C-6A2F-44C4-A486-4839C7604284_2/SkgOidlDPIRRkAZrsmZJ83I6hW4pvLU4twIyKDuyasYz/Image)

然后刷新 qBittorrent 的页面，打开插件设置，就可以看到该地址和该插件已经配置成功了： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/5EA4A29E-0CD0-4ED6-9AAA-43BF96F70307_2/UH8P5sPqGzwlhRjCydcdJELz3xvakC1zrs6ia83Ztdoz/Image)

至此配置完毕。

> 注：配置完 Jackett 后，还要在 Jackett 服务中添加 Indexer ，让 Jackett 知道从哪些网站搜索种子，这个过程比较简单，如下：

点击 Add Indexer 然后从弹出来的界面，右侧点击 + 即可，我是将所有类型是 Public 的同时语言是中文或者英文的站点都加入了（加入后这个待加入列表就不显示已经加入后的了，所以截图中很少有中文、英文和 Public 的站点）。Private 的需要会员 cookie： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/9643CEC0-1D25-4931-8411-B37EB09F96FF_2/xe6C2yhF435W7PoP8HBosixyhdOcBmy2ybg0FhK0Cgkz/Image)

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/35B84985-B043-4FD8-B153-45DD8F75EDA8_2/v6g3fsA7yDQWTxxPa2rsd3Us8aFlK6kquWdjV8LQa58z/Image)

Categories 顾名思义就是网站资源类型，其中 XXX 是 你懂的，不过这种资源下载的人比较少，所以比较难用 BT 下载到，因为 BT 的原理是下载的人越多，下载越快。

另外因为一些历史原因，国内的资源很少，而国外的资源无论多旧，总是很多且很快，哎，大环境下我们每个人都有责任，这里不多说。

比如下载一个旧的两年前的国产电影《疯狂的外星人》： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/6F54A106-42DB-40AB-A8D9-A9DD5A7E5F66_2/zlGi6ymyj0hcoUDOrEoSmW8c1ULIiyooxZxOgDtkV0Uz/SCR-20220421-x9x.png)

做种和资源都很少，但是下载一个十几年前的国外电影 Harry Potter 却很多： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/3A378FA4-66BD-474D-A38B-CA2DF8FA6CE8_2/zTPsXXytyBMxf3hhCKNtTY0ynxTljMB7CHQ8K0Euozcz/SCR-20220421-x8k.png)

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/8DB69130-0789-43E4-B192-BB8E73DA74B7_2/XYbKvufgtfvugAg15MQEWLkMaGuzYJHWI17HtF8vPIkz/WechatIMG29.jpeg)

至此路由器端配置结束，接下来就是最后一步，在播放端如 Infuse 中添加软路由外接硬盘，观看上面的电影了。

#### 配置 Infuse 

这一个步骤就比较简单了，用的还是刚才的配置 WebDAV 的那个方式，只是这次把 WebDAV 协议换成了 SMB 协议，直接上图： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/A467446C-B096-4ADD-B14E-E6454425FA34_2/5xWy7cBlTJb0agDsWt74XoPhjGhy8PJlFXYuGhM61NUz/Image)

其中 `位址` 就是软路由地址，我的就是 `192.168.7.2`. 端口默认 445 即可。

下面是效果图： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/DA2FBBEA-E138-4BD0-A330-4F3C17A98AFD_2/7SLEVbSViLNUU5Sk61Motml7pkpyMAlO5J99pf3bfEsz/Image)

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/6CE14BDE-5EE6-4AFB-90BA-45F473B27B98_2/vyU2C4eDIOoXZmbjQ9tA0cnnZOScEXH9Q6islQONTQ4z/Image)

## 测试

试试阿里云盘的网速测试： 

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/1BC91F6C-490D-4F64-9B97-7CEFE566C169_2/SHpdGMdyNGTUcGSF16g10eggLjzAHFZyPRIv2mfyWTkz/Image)

试试软路由外接硬盘的网速测试：

![Image](https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/0E418850-554B-40BB-A623-D7B8520BB8DC/5EC99DBA-D277-4FC4-9F36-CA1B0ADCF42D_2/fuZxS1IXop6DVrjvsJwcBxl4eJZY0Sxgxd6jGlKQS0wz/Image)

本地外接硬盘（走的是局域网）还没有远端挂载阿里云盘（走的是 HTTP）的速度快的原因是，SMB 有速度限制。

## 后话

电子产品或者软件的目标应该是以人为中心进行服务的，而不是让人来适应软件。这也是 MacOS 口碑比 Windows 好的原因。我相信没有人愿意每天折腾这些东西，谁都想有一个开箱即用的电视、电视盒子、电视软件，但现实的种种使我们无法做到省心，此时不要怕麻烦，为了哪些不会折腾的人而折腾（比如家人），给他们提供一种开箱即用的电视、电视盒子、电视软件，也是一种幸福。

祝大家都能观影自由！