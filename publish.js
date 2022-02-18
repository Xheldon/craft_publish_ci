const COS = require('cos-nodejs-sdk-v5');
const tencentcloud = require('tencentcloud-sdk-nodejs');
const fs = require('fs');
const axios = require('axios');
const {Octokit} = require('octokit');
const {pushToGithub} = require('./utils');

module.exports = async ({github, context, core}) => {
    const {
        COS_SECRET_ID,
        COS_SECRET_KEY,
        COS_BUCKET,
        COS_REGION,
        GIT_HUB_TOKEN,
        GIT_HUB_BRANCH,
        GIT_HUB_REPO,
        GIT_HUB_OWNER,
    } = process.env;
    const cos = new COS({
        SecretId: COS_SECRET_ID,
        SecretKey: COS_SECRET_KEY,
    });
    if (context && context.payload.head_commit.message.startsWith('NO')) {
        console.log('任务被主动终止');
        return;
    }
    // 解析 markdown 中的图片地址
    let content = fs.readFileSync('./content.md', {
        encoding: 'utf-8',
    });
    if (content) {
        let cosPath = content.match(/^cos\:(.*)/m)[1].trim() + '/';
        if (!cosPath) {
            console.log('---cosPath 不存在，本文没有图片，直接上传文章');
            pushToGithub(content);
            return;
        } else {
            let docImgUrlList = [...(content.matchAll(/^!\[.*]\((.*)\)$/mg))].map((imgEntry) => imgEntry[1]);
            let docImgUrlKeyMap = [];
            let docImgsPath = docImgUrlList.map((docImgUrl) => {
                // Note: 不带 . （没有后缀名）的图片是 Web 端上传的，Mac 端上传的图片带后缀，我们只处理带后缀的
                //  详见我在官方论坛提的问题：https://forum.developer.craft.do/t/what-the-image-unique-id/371
                if (docImgUrl.includes('.')) {
                    let arr = new URL(docImgUrl).pathname.split('/');
                    // Note: docImgUrl 形如 img/in-post/qing-zheng-lu-yu/xxxxx_Image.png;
                    const name = `img/in-post/${cosPath}${arr[6]}_${arr[arr.length - 1]}`;
                    docImgUrlKeyMap.push({
                        name,
                        url: docImgUrl,
                    });
                    // Note: 这个值用来快速对比的，其实没啥用
                    return name;
                }
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
                        const resImgs = docImgUrlKeyMap.filter(img => uploadList.includes(img.name)).map(img => img.url);
                        console.log('====================即将获取远端 Craft 图片====================');
                        Promise.all(resImgs.map((imgUrl, k) => {
                            return axios({
                                method: 'get',
                                url: imgUrl,
                                responseType: 'arraybuffer',
                            }).then(res => {
                                if (res.status === 200) {
                                    console.log(`---获取第 ${k + 1} 个远端图片列表成功：${imgUrl}`);
                                    return {
                                        buffer: res.data,
                                        url: imgUrl,
                                    }
                                }
                                throw new Error(`!!!!!!获取 Craft 第 ${k + 1} 个图片失败: ${imgUrl}`);
                            });
                        })).then(resImgs => {
                            let count = 0;
                            console.log('====================即将上传图片到腾讯云 COS ====================');
                            resImgs.forEach(img => {
                                const key = docImgUrlKeyMap.find(imgEntry => imgEntry.url === img.url).name;
                                cos.putObject({
                                    Bucket: COS_BUCKET,
                                    Region: COS_REGION,
                                    Key: key,
                                    Body: img.buffer,
                                }, function (err, data) {
                                    if (err) {
                                        console.log('!!!!!!上传图片错误:', err.statusCode, err, img.url);
                                        return;
                                    }
                                    console.log(`------上传成功: ${key}`);
                                    count++;
                                    // Note: 上传成功后需要写入 content.md 中，然后传到 GitHub x_blog_src 中
                                    content = content.replace(`](${img.url})`, `](https://static.xheldon.cn/${key})`);
                                    if (count === resImgs.length) {
                                        console.log('====================即将更新文档内容到博客仓库====================');
                                        pushToGithub({
                                            context,
                                            content,
                                        });
                                    }
                                });
                            });
                        })
                        .catch(err => {
                            console.log('!!!!!!获取 Craft 图片列表失败:', err);
                        });
                    } else {
                        console.log('------无需上传文件，替换页面中的图片链接即可');
                        // TODO: 替换页面中的图片链接
                    }
                    // Note: 找出远端有，本地无的文件，删除之
                    const deleteList = [];
                    cosImgsPath.forEach(cosImgPath => {
                        if (!docImgsPath.includes(cosImgPath && cosImgPath.trim())) {
                            deleteList.push(cosImgPath);
                        }
                    });
                    if (deleteList.length) {
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
                            console.log(`!!!!!!删除 ${data.Deleted.Key} 成功`);
                            // TODO: 刷新 CDN 缓存
                            if (data.Error && Array.isArray(data.Error) && data.Error.length) {
                                console.log(`!!!!!!删除 ${data.Error.Key} 失败，状态码:${data.Error.Code}，信息:${data.Error.Message}`);
                            }
                        });
                    }
                }
            });
        }
    }
}