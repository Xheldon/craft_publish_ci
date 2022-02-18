const {Octokit} = require('octokit');

exports.pushToGithub = ({
    context,
    content,
}) => {
    const {
        GIT_HUB_TOKEN,
        GIT_HUB_BRANCH,
        GIT_HUB_REPO,
        GIT_HUB_OWNER,
    } = process.env;
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