// version v0.0.1
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const KEY = process.env.JD_COOKIE
const serverT = process.env.PUSH_TOKEN

async function downFile () {
    // const url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
    const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js'
    await download(url, './')
}

async function changeFiele () {
   let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8')
   content = content.replace(/var Key = ''/, `var Key = '${KEY}'`)
   await fs.writeFileSync( './JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify (text,desp) {
  const options ={
    uri:  'https://leom.me:30088/wechat-work-pusher/card',
    headers: { 'Cookie': `session=${serverT}`},
    form: {
        title: text,
        description: desp,
        url: 'https://home.m.jd.com'
    },
    method: 'POST'
  }
  await rp.post(options).then(res=>{
    console.log(res)
  }).catch((err)=>{
    console.log(err)
  })
}

async function start() {
  if (!KEY) {
    console.log('请填写 key 后在继续')
    return
  }
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 替换变量
  await changeFiele();
  console.log('替换变量完毕')
  // 执行
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log('执行完毕')

  if (serverT) {
    const path = "./result.txt";
    let content = "";
    let trimContent = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
      trimContent = content.substring(content.indexOf('【签到概览】'),content.indexOf('京东商城-京豆:')-1)+'\n'+content.substring(content.indexOf('签到用时'),content.length)+'\n'+'点击前往京东查看账号详情~';
    }
    console.log(content)
    await sendNotify("京东签到-" + new Date().toLocaleDateString(), trimContent);
    console.log('发送结果完毕')
  }
}

start()
