const {Octokit} = require('octokit');
const tencentcloud = require('tencentcloud-sdk-nodejs');

exports.pushToGithub = ({
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
}

exports.purgeUrlCache = (url) => {
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

exports.getImageSuffix = (fileBuffer) => {
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