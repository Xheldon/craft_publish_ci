const {Octokit} = require('octokit');
const tencentcloud = require('tencentcloud-sdk-nodejs');
const axios = require('axios');
const markdown = require('markdown-it');
const Sharp = require('sharp');
const sha1 = require('sha1');
const JSDOM = require('jsdom').JSDOM;
const md = new markdown();

const token = 'Xheldon_blog'

const wechatSignature = () => {
    const timestamp = Date.now();
    const random = Math.random() * 10000;
    const string = [timestamp, random, token].sort().join('');
    const signature = sha1(string);
    return {
        timestamp,
        random,
        signature,
    }
};

const sendImgToWechat = (thumbUrl) => {
    return axios({
        method: 'get',
        url: thumbUrl,
        responseType: 'arraybuffer',
    }).then(res => {
        if (res.status === 200) {
            return Sharp(res.data)
                .jpeg({
                    mozjpeg: true
                })
                .toBuffer({resolveWithObject: true})
                .then(({data, info}) => {
                    return axios({
                        method: 'post',
                        url: 'https://wechat.xheldon.cn/uploadImage',
                        data: {
                            ...wechatSignature(),
                            data: data.toString('binary'),
                            options: {
                                filename: 'xheldon.jpeg',
                                contentType: 'image/jpeg',
                                filelength: data.length,
                            }
                        }
                    }).then(({data}) => {
                        console.log('data:', data.data);
                        return data.data;
                    });
                });
        }
    });
};

const pushToGithub = ({
    context,
    content,
    debug,
}) => {
    const {
        GIT_HUB_TOKEN,
        GIT_HUB_BRANCH,
        GIT_HUB_REPO,
        GIT_HUB_OWNER,
    } = process.env;
    if (debug) {
        console.log('---上传到 Github 的内容:', content);
        return;
    }
    const octokit = new Octokit({auth: GIT_HUB_TOKEN});
    const owner = GIT_HUB_OWNER;
    const repo = GIT_HUB_REPO;
    const branch = GIT_HUB_BRANCH;
    const git_message = context && context.payload.head_commit.message || 'NO';
    const path = content.match(/^path: (.*)$/m)[1].trim();
    const shaMatch = content.match(/^sha:(.*)$/m);
    let sha = '';
    if (shaMatch) {
        sha = shaMatch[1].trim();
    }
    const config = {
        owner,
        repo,
        branch,
        path,
        message: git_message,
        ...(sha ? {sha} : {}),
        content: (new Buffer.from(content)).toString('base64'),
    };
    octokit.rest.repos.createOrUpdateFileContents(config).then(data => {
        console.log('~~~~~~~~~~~~~~~~~更新成功:', data.status);
    }).catch(err => {
        console.log(`~~~~~~~~~~~~~~~~~${sha ? '更新' : '创建'} ${path} 失败:`, err);
    });
    // Note: 以下是将文章同步到微信公众号草稿箱流程
    /**
     * 1. 将 content 内容的 meta 信息删除（用正则）
     * 2. 将 content 中的图片上传到微信公众号（github 拉取国内的腾讯云不知道速度怎么样，待测试，很慢的话就拉取 Craft 原图好了）
     * 3. 使用 markdown 转 HTML 的库，将内容转为 HTML，然后调用微信公众号 API，将 HTML 发布为草稿
     * 其中需要注意的是：
     * 1. 重复发布同一篇文章的时候如何处理？
     *  1. 如果 content 的 meta 信息有 lastUpdateTime 表示是重复发布的，不再发布之
     * 2. 发送到微信的文章，仅仅是摘要，不包含全文，如果需要全文就需要点击 阅读原文 才行
     * 3. 图片的缩略图，是 craft 中第一个图/
     */
    // Note: 获取草稿列表 title
    console.log('-----------即将进行微信公众号发布流程-----------');
    const title = content.match(/^title\:(.*)/m)[1].trim();
    const shouldContinue = content.match(/^lastUpdateTime\:(.*)/m);
    // Note: 是否强制发布草稿，一般应用于补齐之前的文章，会在插件里面带上强制发布到 FORCE_TO_WECHAT 的 message
    const force = git_message.match(/FORCE_TO_WECHAT/g);
    if (!force && shouldContinue && shouldContinue[1] && shouldContinue[1].trim()) {
        // Note: 本次文章已经发布过，因此不再继续
        return;
    }
    const headerImgUrl = content.match(/^header\-img\:(.*)/m);
    const categories = content.match(/^categories\:(.*)/m)[1].trim();
    const webPath = `https://www.xheldon.com/${categories}/${content.match(/^cos\:(.*)/m)[1].trim().split('/')[1]}.html`;
    console.log('webPath:', webPath);
    let thumbUrl = '';
    if (headerImgUrl && headerImgUrl[1] && headerImgUrl[1].trim()) {
        thumbUrl = headerImgUrl[1].trim();
    } else {
        thumbUrl = content.match(/^!\[.*]\((.*)\)$/m)[1].trim();
    }
    const author = 'Xheldon';
    // Note: 移除 meta 信息
    let realContent = content.match(/^---\n[\s\S]*---([\s\S]*)/);
    if (realContent && realContent[1]) {
        realContent = md.render(realContent[1].slice(0, 3000));
    }
    const wechatConfig = {
        title,
        author,
        content_source_url: webPath,
        need_open_comment: 1,
        only_fans_can_comment: 0,
    };
    sendImgToWechat(thumbUrl).then(({media_id, url}) => {
        if (media_id) {
            console.log('上传图片素材成功:', media_id);
            wechatConfig.content = modifyContent(realContent, url),
            wechatConfig.thumb_media_id = media_id;
        } else {
            console.log('上传图片素材错误:', media_id);
            return;
        }
        console.log('上传图文素材成功，即将开始新增草稿');
        addDraftToWechat(wechatConfig).then(media_id => {
            if (media_id) {
                console.log(`新增草稿成功，请手动发布, mediaid:${media_id}`);
            }
        });
    });
    // Note: 将 content 中的图片放到微信的服务器中
}

const purgeUrlCache = (url) => {
    const {
        COS_SECRET_ID,
        COS_SECRET_KEY,
    } = process.env;
    const CdnClient = tencentcloud.cdn.v20180606.Client;
    const clientConfig = {
        credential: {
            secretId: COS_SECRET_ID,
            secretKey: COS_SECRET_KEY,
        },
        region: '',
        profile: {
            httpProfile: {
                endpoint: 'cdn.tencentcloudapi.com',
            }
        }
    };
    const client = new CdnClient(clientConfig);
    const refreshList = url.map(fileName => {
        return `https://static.xheldon.cn/${fileName}`;
    });
    if (refreshList.length) {
        console.log('---CDN 刷新列表:', refreshList);
        client.PurgeUrlsCache({
            Urls: refreshList,
        }).then(
            data => {
                console.log('---刷新成功:', data);
            },
            err => {
                console.log('---刷新失败:', err);
            }
        );
    } else {
        console.log('---本次无需刷新 CDN 缓存');
    }
};

const getImageSuffix = (fileBuffer) => {
    // 将上文提到的 文件标识头 按 字节 整理到数组中
    const imageBufferHeaders = [
      { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
      { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
      { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
      {
        bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        suffix: '.png'
      },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
      { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
      { bufBegin: [0x0a], suffix: '.pcx' },
      { bufBegin: [0x49, 0x49], suffix: '.tif' },
      { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
      {
        bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20],
        suffix: '.ico'
      },
      {
        bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20],
        suffix: '.cur'
      },
      { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
      { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' }
    ]
    for (const imageBufferHeader of imageBufferHeaders) {
      let isEqual
      // 判断标识头前缀
      if (imageBufferHeader.bufBegin) {
        const buf = Buffer.from(imageBufferHeader.bufBegin)
        isEqual = buf.equals(
          //使用 buffer.slice 方法 对 buffer 以字节为单位切割
          fileBuffer.slice(0, imageBufferHeader.bufBegin.length)
        )
      }
      // 判断标识头后缀
      if (isEqual && imageBufferHeader.bufEnd) {
        const buf = Buffer.from(imageBufferHeader.bufEnd)
        isEqual = buf.equals(fileBuffer.slice(-imageBufferHeader.bufEnd.length))
      }
      if (isEqual) {
        return imageBufferHeader.suffix
      }
    }
    // 未能识别到该文件类型
    return ''
}
const addDraftToWechat = (article) => {
    return axios({
        method: 'post',
        url: 'https://wechat.xheldon.cn/addDraft',
        data: {
            ...wechatSignature(),
            data: {
                articles: [article],
            }
        }
    }).then(({data}) => {
        console.log('添加草稿接口成功:', data);
        return data.data.media_id;
    }).catch(err => {
        console.log('草稿发布失败:', err.status, err);
    });
};

const modifyContent = (html, url) => {
    const dom = new JSDOM(html);
    dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6, h7, p').forEach(h => {
        const headingMap = {
            1: 28,
            2: 24,
            3: 20,
            4: 17,
            5: 16,
            6: 15,
            7: 14
        };
        const level = Number(h.tagName.slice(1));
        if (level) {
            h.outerHTML = `<p><span style="font-size:${headingMap[level]}px">${h.textContent}</span></p>`;
        }
        if (h.querySelectorAll('img').length) {
            h.remove();
        }
    });
    return `<p><span style="color: #f04848; font-size: 18px;">本文仅为摘要，过滤了全部的图片内容，因此想获得更好的阅读体验请点击底部的「<b>阅读原文</b>」了解更多~</span></p> <p><img src="${url}" /></p>${dom.window.document.body.innerHTML} <p>--->摘要结束<---</p>`;
};

exports.wechatSignature = wechatSignature;
exports.sendImgToWechat = sendImgToWechat;
exports.pushToGithub = pushToGithub;
exports.purgeUrlCache = purgeUrlCache;
exports.getImageSuffix = getImageSuffix;
exports.addDraftToWechat = addDraftToWechat;
exports.modifyContent = modifyContent;