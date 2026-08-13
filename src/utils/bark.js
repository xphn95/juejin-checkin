const axios = require('axios')
const { BARK_KEY, BARK_SERVER } = require('../ENV.js')
const SUCCESS_CODE = 200
const DEFAULT_SERVER = 'https://api.day.app'
const TIMEOUT = 10000
const MAX_RETRY = 2

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const bark = async ({ title = '', content = '' } = {}) => {
  const server = BARK_SERVER || DEFAULT_SERVER
  const body = htmlToPlainText(content)

  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      const response = await axios.post(
        `${server}/push`,
        {
          device_key: BARK_KEY,
          title,
          body,
        },
        {
          timeout: TIMEOUT,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
        }
      )
      if (response?.data?.code !== SUCCESS_CODE) {
        throw new Error(response?.data?.message)
      }
      console.log(`Bark 推送成功(${server})：${title}`)
      return
    } catch (error) {
      if (i < MAX_RETRY - 1) {
        console.log(`Bark 推送失败(${server})，${i + 1}秒后重试：${error.message}`)
        await wait((i + 1) * 1000)
      } else {
        console.log(error.stack)
      }
    }
  }
}

/**
 * @desc 将 HTML 消息转换为 Bark 可读的纯文本
 * 覆盖 formatMessage 生成的 <p>/<strong>/<details>/<summary>/<ul>/<li>
 */
const htmlToPlainText = html =>
  String(html || '')
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<details>/g, '')
    .replace(/<\/details>/g, '')
    .replace(/<summary>/g, '')
    .replace(/<\/summary>/g, '\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '\n• ')
    .replace(/<\/li>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

module.exports = bark
