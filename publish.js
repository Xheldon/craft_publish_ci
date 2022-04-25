const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const axios = require('axios');
const {Octokit} = require('octokit');
const sharp = require('sharp');

const {pushToGithub, purgeUrlCache} = require('./utils');

module.exports = async ({context}) => {
    const {
        COS_SECRET_ID,
        COS_SECRET_KEY,
        COS_BUCKET,
        COS_REGION,
        WECHAT_TOKEN, // Note: 随便一个字符，鉴权用，发送端和服务端需要保持一致
    } = process.env;
    const cos = new COS({
        SecretId: COS_SECRET_ID,
        SecretKey: COS_SECRET_KEY,
    });
    if (context && context.payload.head_commit.message.startsWith('NO')) {
        console.log('任务被主动终止');
        return;
    }
    let debug = false;
    if (context && context.payload.head_commit.message.startsWith('DEBUG')) {
        console.log('开启调试模式，图片不会真的上传到云端');
        debug = true;
    }
    // 解析 markdown 中的图片地址
    let content = fs.readFileSync('./content.md', {
        encoding: 'utf-8',
    });
    if (content) {
        let cosPath = content.match(/^cos\:(.*)/m);
        if (!cosPath || !cosPath[1] || !cosPath[1].trim()) {
            console.log('---cosPath 不存在，本文没有图片，直接上传文章');
            pushToGithub({
                context,
                content,
                debug
            });
            return;
        } else {
            cosPath = cosPath[1].trim();
            let docImgUrlList = [...(content.matchAll(/^!\[.*]\((.*)\)$/mg))].map((imgEntry) => imgEntry[1]);
            let docImgUrlKeyMap = [];
            // Note: header-image 也需要 push 一下
            let headerImg = content.match(/^header-img\:(.*)/m);
            if (headerImg && headerImg[1]) {
                docImgUrlList.push(headerImg[1].trim());
            }
            let docImgsPath = docImgUrlList.map((docImgUrl) => {
                // Note: 不带 . （没有后缀名）的图片是 Web 端上传的，Mac 端上传的图片带后缀，我们只处理带后缀的
                //  详见我在官方论坛提的问题：https://forum.developer.craft.do/t/what-the-image-unique-id/371
                let arr = new URL(docImgUrl).pathname.split('/');
                // Note: docImgUrl 形如 img/in-post/qing-zheng-lu-yu/xxxxx_Image.png;
                // Note: 所有图片，都转换成 png，免得麻烦
                let name = '';
                if (arr.length > 4) {
                    name = `img/in-post/${cosPath}/${arr[6]}.png`;
                } else {
                    name = `img/in-post/${cosPath}/${arr[1]}.png`;
                }
                docImgUrlKeyMap.push({
                    name,
                    url: docImgUrl,
                });
                // Note: 这个值用来快速对比的，其实没啥用
                return name;
            });
            cos.getBucket({
                Bucket: COS_BUCKET,
                Region: COS_REGION,
                Prefix: `img/in-post/${cosPath}`,
            }, function (err, data) {
                if (err) {
                    console.log(`!!!!!!获取 ${cosPath} 目录内容错误:`, err);
                    return;
                }
                if (data.statusCode === 200) {
                    // Note: 坑：data.Contents 如果目录下只有一个文件的时候，是个对象，就离谱。
                    const contents = data.Contents;
                    if (debug) {
                        console.log(`调试模式 ${cosPath} 目录内容:`, contents);
                    }
                    if (contents && !Array.isArray(contents)) {
                        contents = [contents];
                    }
                    const cosImgsPath = contents.map(content => content.Key);
                    // Note: 找出远端无，本地有的文件，新增之
                    const uploadList = [];
                    docImgsPath.forEach(docImgPath => {
                        if (!cosImgsPath.includes(docImgPath)) {
                            uploadList.push(docImgPath);
                        }
                    });
                    if (uploadList.length > 0) {
                        console.log(`---获取需要上传 ${cosPath} 目录的文件列表:`, uploadList);
                        // 先拉取远端的来自 res.craft.do 的图片，放到 Promise 中，都 resolve 后，再批量上传
                        const resImgs = docImgUrlKeyMap.filter(img => uploadList.includes(img.name));
                        console.log('====================即将获取远端 Craft 图片====================');
                        Promise.all(resImgs.map((imgUrl, k) => {
                            return axios({
                                method: 'get',
                                url: imgUrl.url,
                                responseType: 'arraybuffer',
                            }).then(res => {
                                if (res.status === 200) {
                                    console.log(`---获取第 ${k + 1} 个远端图片列表成功：${imgUrl.url}`);
                                    // Note: 将图片都转成 png 格式，然后再返回
                                    return sharp(res.data)
                                            .withMetadata({
                                                exif: {
                                                IFD0: {
                                                    Copyright: 'image from xheldon.com'
                                                }
                                                }
                                            })
                                            .png()
                                            .toBuffer({resolveWithObject: true})
                                            .then(({data, info}) => {
                                                return {
                                                    buffer: data,
                                                    url: imgUrl.url,
                                                    name: imgUrl.name,
                                                }
                                            });
                                }
                                throw new Error(`!!!!!!获取 Craft 第 ${k + 1} 个图片失败: ${imgUrl.url},${imgUrl.name}`);
                            });
                        })).then(resImgs => {
                            let count = 0;
                            console.log('====================即将上传图片到腾讯云 COS ====================');
                            if (debug) {
                                console.log('调试模式，获取即将上传的图片内容:', resImgs);
                                return;
                            }
                            resImgs.forEach(img => {
                                // Note: 上传到 cos
                                cos.putObject({
                                    Bucket: COS_BUCKET,
                                    Region: COS_REGION,
                                    Key: img.name,
                                    Body: img.buffer,
                                }, function (err, data) {
                                    if (err) {
                                        console.log('!!!!!!上传图片错误:', err.statusCode, err, img.url, img.name);
                                        return;
                                    }
                                    console.log(`---上传成功${count++}: ${img.url} -> ${img.name}`);
                                    if (count === resImgs.length) {
                                        // Note: 需要替换全部的图片地址
                                        docImgUrlKeyMap.forEach(img => {
                                            content = content.replace(`${img.url}`, `https://static.xheldon.cn/${img.name}`);
                                        });
                                        console.log('====================即将更新文档内容到博客仓库====================');
                                        pushToGithub({
                                            context,
                                            content,
                                            debug,
                                        });
                                        console.log('====================即将刷新 「上传新文件」的 CDN 缓存====================');
                                        // Note: 刷新 cdn
                                        purgeUrlCache(resImgs.map(img => img.name).filter(Boolean));
                                    }
                                });
                            });
                        })
                        .catch(err => {
                            console.log('!!!!!!获取 Craft 图片列表失败:', err);
                        });
                    } else {
                        console.log('---无需上传文件，替换页面中的图片链接即可');
                        docImgUrlKeyMap.forEach(map => {
                            content = content.replace(`${map.url}`, `https://static.xheldon.cn/${map.name}`);
                        });
                        console.log('---替换完成，即将更新文档内容到博客仓库');
                        pushToGithub({
                            context,
                            content,
                            debug,
                        });
                    }
                    // Note: 找出远端有，本地无的文件，删除之
                    const deleteList = [];
                    cosImgsPath.forEach(cosImgPath => {
                        if (!docImgsPath.includes(cosImgPath && cosImgPath.trim())) {
                            deleteList.push(cosImgPath);
                        }
                    });
                    if (deleteList.length) {
                        let count = 0;
                        console.log(`---获取需要删除 ${cosPath} 目录下的文件列表:`, deleteList);
                        if (debug) {
                            console.log('调试模式，获取即将删除的图片内容:', deleteList);
                            return;
                        }
                        cos.deleteMultipleObject({
                            Bucket: COS_BUCKET,
                            Region: COS_REGION,
                            Objects: deleteList.map(name => ({Key: name})),
                        }, (err, data) => {
                            if (err) {
                                console.log(`!!!!!!删除 ${cosPath} 目录下的文件是发生错误:`, err);
                                return;
                            }
                            count++;
                            console.log(`---删除 ${data.Deleted.Key} 成功`);
                            if (data.Error && Array.isArray(data.Error) && data.Error.length) {
                                console.log(`!!!!!!删除 ${data.Error.Key} 失败，状态码:${data.Error.Code}，信息:${data.Error.Message}`);
                            }
                            if (count === deleteList.length) {
                                console.log('====================即将刷新 「删除旧文件」的 CDN 缓存====================');
                                purgeUrlCache(deleteList);
                            }
                        });
                    }
                }
            });
        }
    }
}