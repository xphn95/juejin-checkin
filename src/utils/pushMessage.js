const email = require('./email.js')
const pushplus = require('./pushplus.js')
const dingding = require('./dingding.js')
const feishu = require('./feishu.js')
const bark = require('./bark.js')
const { EMAIL, AUTHORIZATION_CODE, PUSHPLUS_TOKEN, DINGDING_WEBHOOK, FEISHU_WEBHOOK, BARK_KEY } = require('../ENV.js')

const pushMessage = ({ type, message }) => {
  console.log(message)
  EMAIL &&
    AUTHORIZATION_CODE &&
    email(
      formatter(type, message, {
        style: 'html',
        bold: true,
      })
    )
  PUSHPLUS_TOKEN &&
    pushplus(
      formatter(type, message, {
        style: 'html',
        bold: false,
        wordWrap: true,
      })
    )
  DINGDING_WEBHOOK &&
    dingding(
      formatter(type, message, {
        style: 'markdown',
        bold: true,
        wordWrap: true,
      })
    )
  FEISHU_WEBHOOK &&
    feishu(
      formatter(type, message, {
        style: 'markdown',
        bold: true,
      })
    )
  BARK_KEY &&
    bark(
      formatter(type, message, {
        style: 'plain',
        bold: false,
        wordWrap: true,
      })
    )
}

/**
 * @desc 格式化消息内容
 * @param type 类型
 * @param message 内容
 * @param options 配置
 * {
 *   style: String 风格
 *   bold: Boolean 是否数字加粗
 *   wordWrap: Boolean 是否换行
 * }
 * @returns {Object}
 * {
 *   title: String 标题
 *   content: String 内容
 * }
 */
const formatter = (type = 'info', message = '', options = {}) => {
  // const { style = 'html', bold = false, wordWrap = false } = options

  // if (bold && type === 'info') {
  //   style === 'html' && (message = message.replace(/\+?\d+/g, ' <b>$&</b> '))
  //   style === 'markdown' && (message = message.replace(/\+?\d+/g, ' **$&** '))
  // }

  // if (wordWrap) {
  //   style === 'markdown' && (message = message.replace(/\n/g, ' \n\n > ').replace(/ +/g, ' '))
  // }

  return {
    title: `签到${type === 'info' ? '成功 🎉' : '失败 💣'}`,
    content: message,
  }
}

module.exports = pushMessage