const axios = require('axios')
const encrypt = require('../encrypt/encrypt.js')
const SUCCESS_CODE = 0
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

const http = axios.create({
  baseURL: 'https://api.juejin.cn',
  headers: {
    'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'Accept': 'application/json, text/plain, */*',
    'sec-ch-ua-mobile': '?0',
    'referer': 'https://juejin.cn/',
    'User-Agent': userAgent,
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  },
})

http.interceptors.request.use(
  config => {
    if (config.metadata?.addEncryptParams) {
      const uuid = encrypt.getUuid()
      const msToken = encrypt.getMsToken()
      const query = `uuid=${uuid}&msToken=${msToken}&aid=2608&spider=0`;
      const aBogus = encrypt.getAbogus(query, userAgent)
      config.url = `${config.url}?${query}&a_bogus=${aBogus}`;
    }
    console.log(`请求URL:  ${config.url}，请求方式: ${config.method}`);
    return config
  },
  error => Promise.reject(error)
)

http.interceptors.response.use(
  response => {
    console.log("响应结果：", response.data);
    if (response?.data?.err_no !== SUCCESS_CODE) {
      return Promise.reject(response?.data ?? "响应结果为空！")
    }
    return Promise.resolve(response?.data?.data ?? {})
  },
  error => {
    console.log("响应错误", error);
    return Promise.reject(error)
  }
)

http.setCookie = cookie => {
  http.defaults.headers.cookie = cookie
  http.cookie = cookie // 保存 cookie，供 browser.js(Playwright) 使用
}

module.exports = http