require('dotenv').config();

module.exports = {
  COOKIE: process.env.COOKIE,
  EMAIL: process.env.EMAIL,
  AUTHORIZATION_CODE: process.env.AUTHORIZATION_CODE,
  PUSHPLUS_TOKEN: process.env.PUSHPLUS_TOKEN,
  DINGDING_WEBHOOK: process.env.DINGDING_WEBHOOK,
  FEISHU_WEBHOOK: process.env.FEISHU_WEBHOOK,
  BARK_KEY: process.env.BARK_KEY,
  BARK_SERVER: process.env.BARK_SERVER,
}