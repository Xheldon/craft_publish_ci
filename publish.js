const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const axios = require('axios');
const {Octokit} = require('octokit');
const {pushToGithub, purgeUrlCache} = require('./utils');

module.exports = async ({context}) => {
    const {
        COS_SECRET_ID,
        COS_SECRET_KEY,
        COS_BUCKET,
        COS_REGION,
    } = process.env;
    const cos = new COS({
        SecretId: COS_SECRET_ID,
        SecretKey: COS_SECRET_KEY,
    });
    let debug = false;
    if (context && context.payload.head_commit.message.startsWith('NO')) {
        console.log('任务被主动终止');
        return;
    }
    if (context && context.payload.head_commit.message.startsWith('DEBUG')) {
        console.log('开启调试模式, 不会推送到 github');
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
                debug,
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
                // Note: 更新：无论是 Web 端的，还是 Mac 端传的，我们先定位到是图片后，使用 res.header.content-type 进行类型判断
                let arr = new URL(docImgUrl).pathname.split('/');
                let name = '';
                if (arr.length > 4) {
                    // Note: arr > 3 表示是自己上传的，否则是从 unsplash 上传的
                    // Note: docImgUrl 形如 img/in-post/qing-zheng-lu-yu/xxxxx_Image.png;
                    // Note: 无论是 Mac 还是 Web 端，上传的图片中，第 6 个元素都可以作为 id
                    //  其中 Mac 第六个是 block id，Web 第六个是文件名（随机 hash）
                    //  Mac：https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/5B15834E-4C1F-452D-82A5-15D3EEE6447E/42A6EFC4-B89F-47CB-A2EE-573C50A3AAB1_2/o5KJQssEMpH9yDZB3tAh7cdHf3aB7xuihAlTBqXi7q8z/Image
                    //   or https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/5B15834E-4C1F-452D-82A5-15D3EEE6447E/42A6EFC4-B89F-47CB-A2EE-573C50A3AAB1_2/o5KJQssEMpH9yDZB3tAh7cdHf3aB7xuihAlTBqXi7q8z/Image.png
                    //  Web：https://res.craft.do/user/full/747e0824-8866-cf67-b3ae-2e207380d1f9/doc/5B15834E-4C1F-452D-82A5-15D3EEE6447E/1ac70d37-5757-4182-8dbf-13672b3a454a
                    //  unsplash: https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?crop=entropy&cs=srgb&fm=jpg&ixid=MnwxNDIyNzR8MHwxfHNlYXJjaHw0fHxrfGVufDB8fHx8MTY0NjEzODk3Mg&ixlib=rb-1.2.1&q=85
                    name = `img/in-post/${cosPath}/${arr[6]}`;
                } else {
                    name = `img/in-post/${cosPath}/${arr[1]}`;
                }
                console.log('------name', name);
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
                    if (contents && !Array.isArray(contents)) {
                        contents = [contents];
                    }
                    const cosImgsPath = contents.map(content => content.Key);
                    // Note: 不管 3721，先拉下来文档中全部的图片，然后添加后缀名再说
                    Promise.all(docImgUrlKeyMap.map((imgUrl, k) => {
                        return axios({
                            method: 'get',
                            url: imgUrl.url,
                            responseType: 'arraybuffer',
                        }).then(res => {
                            if (res.status === 200) {
                                console.log(`---获取第 ${k + 1} 个远端图片列表成功：${imgUrl.url}, headers:`, JSON.stringify(res.headers));
                                // Note: 上面没有加图片后缀，所以这里要加上
                                // const contnetType = res.headers['content-type'];
                                // Note: 坑：从 content-type 不靠谱，因为有些图片是 application/octet-stream 的，因此此处使用魔法数字
                                const suffix = getImageSuffix(res.data);
                                console.log(`---获取第 ${k + 1} 个远端图片格式成功：${suffix}`);
                                if (suffix) {
                                    return {
                                        buffer: res.data,
                                        url: imgUrl.url,
                                        name: `${imgUrl.name}_.${suffix}`,
                                    };
                                }
                            }
                            throw new Error(`!!!!!!获取 Craft 第 ${k + 1} 个图片失败:\n ${imgUrl.url},\nheader:${JSON.stringify(res.headers['contente-type'])},\n name:${imgUrl.name}\n`);
                        });
                    }).filter(Boolean)).then(resImgs => {
                        let count = 0;
                        console.log('====================即将上传图片到腾讯云 COS ====================');
                        // Note: 此时再过滤看哪些需要上传，哪些需要删除，哪些不需要上传
                        // Note: 找出远端无，本地有的文件，新增之
                        const uploadList = [];
                        resImgs.forEach(img => {
                            if (!cosImgsPath.includes(img.name)) {
                                uploadList.push(img);
                            }
                        });
                        console.log('------uploadList', uploadList, '\n');
                        if (uploadList.length && !debug) {
                            uploadList.forEach(img => {
                                console.log('---即将上传图片到腾讯云 COS:', img.name,'\n', img.url);
                                cos.putObject({
                                    Bucket: COS_BUCKET,
                                    Region: COS_REGION,
                                    Key: img.name,
                                    Body: img.buffer,
                                }, function (err, data) {
                                    if (err) {
                                        console.log('!!!!!!上传图片错误:', err.statusCode, err, img.url);
                                        return;
                                    }
                                    console.log(`---上传成功${count++}: ${img.name}`);
                                    // Note: 上传成功后需要写入 content.md 中，然后传到 GitHub x_blog_src 中
                                    if (count === uploadList.length) {
                                        resImgs.forEach(map => {
                                            content = content.replace(`${map.url}`, `https://static.xheldon.cn/${map.name}`);
                                        });
                                        console.log('====================即将更新文档内容到博客仓库====================');
                                        pushToGithub({
                                            context,
                                            content,
                                            debug,
                                        });
                                        console.log('====================即将刷新 「上传新文件」的 CDN 缓存====================');
                                        // Note: 刷新 cdn
                                        purgeUrlCache(uploadList.map(img => {
                                            return resImgs.find(imgEntry => imgEntry.url === img.url).name
                                        }).filter(Boolean));
                                    }
                                });
                            });
                        } else {
                            if (debug) {
                                console.log('---debug 模式，跳过图片上传，替换页面中的图片链接即可');
                                resImgs.forEach(map => {
                                    content = content.replace(`${map.url}`, `https://static.xheldon.cn/${map.name}`);
                                });
                                console.log('---替换完成，即将更新文档内容到博客仓库');
                                pushToGithub({
                                    context,
                                    content,
                                    debug,
                                });
                            } else {
                                console.log('---无需上传文件，替换页面中的图片链接即可');
                                resImgs.forEach(map => {
                                    content = content.replace(`${map.url}`, `https://static.xheldon.cn/${map.name}`);
                                });
                                console.log('---替换完成，即将更新文档内容到博客仓库');
                                pushToGithub({
                                    context,
                                    content,
                                    debug,
                                });
                            }
                        }
                    })
                    .catch(err => {
                        console.log('!!!!!!获取 Craft 图片列表失败:', err);
                    });

                    


                    // Note: 找出远端有，本地无的文件，删除之
                    const deleteList = [];
                    cosImgsPath.forEach(cosImgPath => {
                        if (!docImgsPath.includes(cosImgPath && cosImgPath.trim())) {
                            deleteList.push(cosImgPath);
                        }
                    });
                    if (deleteList.length) {
                        const count = 0;
                        console.log(`---获取需要删除 ${cosPath} 目录下的文件列表:`, deleteList);
                        cos.deleteMultipleObject({
                            Bucket: COS_BUCKET,
                            Region: COS_REGION,
                            Objects: deleteList
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