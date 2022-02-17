const COS = require('cos-nodejs-sdk-v5');
const tencentcloud = require('tencentcloud-sdk-nodejs');
const fs = require('fs');
const axios = require('axios');
const {Octokit} = require('octokit');




module.exports = async ({github, context, core}) => {
    const {
        COS_SECRET_ID,
        COS_SECRET_KEY,
        COS_BUCKET,
        COS_REGION,
        GIT_HUB_TOKEN, // Github 的 Secrets 开头不能以 GITHUB 开头
        GIT_HUB_BRANCH,
        GTI_HUB_REPO,
        GIT_HUB_OWNER,
    } = process.env;
    const cos = new COS({
        SecretId: COS_SECRET_ID,
        SecretKey: COS_SECRET_KEY,
    });
    if (context && context.payload.head_commit.message.stratsWith('NO')) {
        console.log('任务被主动终止');
        return;
    }
    // 解析 markdown 中的图片地址
    let content = fs.readFileSync('./content.md', {
        encoding: 'utf-8',
    });
    if (content) {
        console.log('------content 存在:', content);
        // 从 meta 中获取信息
        let cosPath = content.match(/^cos\:(.*)/m)[1].trim() + '/';
        console.log('将上传的 cosPath 为:', cosPath);
        if (!cosPath) {
            console.log('未找到 cosPath');
            return;
        }
        // 还有其他信息，用到的时候再格式化
        let docImgUrlList = [...(content.matchAll(/^!\[.*]\((.*)\)$/mg))].map((imgEntry) => imgEntry[1]);
        let docImgUrlKeyMap = [];
        let docImgsPath = docImgUrlList.map((docImgUrl) => {
            // Note: 不带 . （没有后缀名）的图片是 Web 端上传的，Mac 端上传的图片带后缀，我们只处理带后缀的
            //  详见我在官方论坛提的问题：https://forum.developer.craft.do/t/what-the-image-unique-id/371
            if (docImgUrl.includes('.')) {
                let arr = new URL(docImgUrl).pathname.split('/');
                // Note: 形如 img/in-post/qing-zheng-lu-yu/xxxxx_Image.png;
                const name = `img/in-post/${cosPath}${arr[6]}_${arr[arr.length - 1]}`;
                docImgUrlKeyMap.push({
                    name,
                    url: docImgUrl,
                });
                // Note: 这个值用来快速对比的，其实没啥用
                return name;
            }
        });
        // 获取设置的 cos 路径下的图片列表
        cos.getBucket({
            Bucket: COS_BUCKET,
            Region: COS_REGION,
            Prefix: `img/in-post/${cosPath}`,
        }, function (err, data) {
            if (err) {
                console.log('--------错误:', err);
                return;
            }
            console.log('cos contents:', data.Contents);
            if (data.statusCode === 200) {
                const cosImgsPath = data.Contents.map((cosImg) => cosImg.Key);
                // 找出远端有，本地无的文件，删除之
                const deleteList = [];
                cosImgsPath.forEach(cosImgPath => {
                    if (!docImgsPath.includes(cosImgPath)) {
                        deleteList.push(cosImgPath);
                    }
                })
                // 找出远端无，本地有的文件，新增之
                const uploadList = [];
                docImgsPath.forEach(docImgPath => {
                    if (!cosImgsPath.includes(docImgPath)) {
                        uploadList.push(docImgPath);
                    }
                });
                if (uploadList.length > 0) {
                    console.log('-----------------上传文件-----------------');
                    // 先拉取远端的来自 res.craft.do 的图片，放到 Promise 中，都 resolve 后，再批量上传
                    const resImgs = docImgUrlKeyMap.filter(img => uploadList.includes(img.name)).map(img => img.url);
                    console.log('------获取远端图片列表------:', resImgs);
                    Promise.all(resImgs.map((imgUrl, k) => {
                        return axios({
                            method: 'get',
                            url: imgUrl,
                            responseType: 'arraybuffer',
                        }).then(res => {
                            console.log('------获取远端图片列表成功------:', imgUrl);
                            if (res.status === 200) {
                                return {
                                    buffer: res.data,
                                    url: imgUrl,
                                }
                            }
                            throw new Error(`获取 Craft 第 ${k} 个图片失败: ${imgUrl}`);
                        });
                    })).then(resImgBufs => {
                        // Note: resImgBufs 就是从 res.craft.do 中拉取的图片的 buffer
                        resImgBufs.forEach((img, key) => {
                            console.log('------Key:', docImgUrlKeyMap.find(imgEntry => imgEntry.url === img.url).name);
                            let count = 0;
                            cos.putObject({
                                Bucket: COS_BUCKET,
                                Region: COS_REGION,
                                Key: docImgUrlKeyMap.find(imgEntry => imgEntry.url === img.url).name,
                                Body: img.buffer,
                            }, function (err, data) {
                                if (err) {
                                    console.log('--------上传图片错误:', err, img.url);
                                    return;
                                }
                                console.log('--------上传成功:', data);
                                count++;
                                // Note: 上传成功后需要写入 content.md 中，然后传到 GitHub x_blog_src 中
                                content = content.replace(`](${img.url})`, `](https://static.xheldon.cn/${docImgUrlKeyMap.find(imgEntry => imgEntry.url === img.url).name})`);
                                if (count === resImgs.length) {
                                    console.log('====================即将更新文档内容：\n', content);
                                    const octokit = new Octokit({auth: GIT_HUB_TOKEN});
                                    const owner = GIT_HUB_OWNER;
                                    const repo = GTI_HUB_REPO;
                                    const branch = GIT_HUB_BRANCH;
                                    const git_message = context && context.payload.head_commit.message || 'NO';
                                    const path = content.match(/^path: (.*)$/m)[1].trim();
                                    const shaMatch = content.match(/^sha:(.*)$/m);
                                    let sha = '';
                                    if (shaMatch) {
                                        sha = shaMatch[1].trim();
                                    }
                                    // Note: 如果是更新（即文件已经存在，则会存在 sha）
                                    octokit.rest.repos.createOrUpdateFileContents({
                                        owner,
                                        repo,
                                        branch,
                                        path,
                                        message: git_message,
                                        ...(sha ? {sha} : {}),
                                        content: (new Buffer.from(content)).toString('base64'),
                                    }).then(data => {
                                        if ([200, 201].includes(data.status)) {
                                            console.log('~~~~~~~~~~~~~~~~~更新成功:', data);
                                        } else {
                                            console.log('~~~~~~~~~~~~~~~~~更新似乎成功了');
                                        }
                                    }).catch(err => {
                                        console.log(`~~~~~~~~~~~~~~~~~更新 x_blog_src 文件${path}失败:`, err);
                                    });
                                }
                            });
                        });
                    })
                    .catch(err => {
                        console.log('获取远端图片列表失败:', err);
                    });
                }
                if (deleteList.length > 0) {
                    console.log('-----------------删除文件-----------------');
                    console.log('------删除远端图片列表------:', deleteList);
                }
            }
        });
    }
}