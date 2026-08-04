const http = require('./httpInstance.js')
const { getBenefitPage: browserGetBenefitPage } = require('./browser.js')

class Api {
  constructor() {
    this.http = http
  }

  /**
   * @desc 用户信息
   * @returns {Promise<*>}
   * {
   *   user_name: String 用户名
   * }
   */
  getUser() {
    return this.http.get('/user_api/v1/user/get')
  }

  /**
   * @desc 当日签到状态
   * @returns {Promise<*>}
   * Boolean 是否签到
   */
  getTodayStatus() {
    return this.http.get('/growth_api/v2/get_today_status')
  }

  /**
   * @desc 签到
   * @returns {Promise<*>}
   * {
   *   incr_point: Number 获得矿石数
   * }
   */
  checkIn() {
    return this.http.post('/growth_api/v1/check_in', '', {
      metadata: { addEncryptParams: true }
    })
  }

  /**
   * @desc 签到天数
   * @returns {Promise<*>}
   * {
   *   cont_count: Number 连续签到天数
   *   sum_count: Number 累计签到天数
   * }
   */
  getCounts() {
    return this.http.get('/growth_api/v1/get_counts')
  }

  /**
   * @desc 围观大奖记录
   * @param page_no
   * @param page_size
   * @returns {Promise<*>}
   * {
   *   count: Number 数量
   *   lotteries: [
   *     {
   *       history_id: String 记录 ID
   *     }
   *   ]
   * }
   */
  getLotteryHistory({ page_no = 1, page_size = 5 } = {}) {
    return this.http.post('/growth_api/v1/lottery_history/global_big', { page_no, page_size })
  }

  /**
   * @desc 沾喜气
   * @param lottery_history_id
   * @returns {Promise<*>}
   * {
   *   dip_value: Number 幸运值
   *   total_value: Number 总幸运值
   *   has_dip: Boolean 是否沾过
   * }
   */
  dipLucky(lottery_history_id) {
    return this.http.post('/growth_api/v1/lottery_lucky/dip_lucky', { lottery_history_id })
  }

  /**
   * @desc 幸运值查询
   * @returns {Promise<*>}
   * data.total_value 幸运值
   */
  getLucky() {
    return this.http.post('/growth_api/v1/lottery_lucky/my_lucky')
  }

  /**
   * @desc 免费抽奖次数
   * @returns {Promise<*>}
   * {
   *   free_count: Number 免费次数
   * }
   */
  getLotteryConfig() {
    return this.http.get('/growth_api/v1/lottery_config/get', {
      metadata: { addEncryptParams: true }
    })
  }

  /**
   * @desc 抽奖
   * @returns {Promise<*>}
   * {
   *   lottery_name: String 奖品名称
   * }
   */
  drawLottery() {
    return this.http.post('/growth_api/v1/lottery/draw', '', {
      metadata: { addEncryptParams: true }
    })
  }

  /**
   * @desc 当前矿石数
   * @returns {Promise<*>}
   * Number 矿石数量
   */
  getCurrentPoint() {
    return this.http.get('/growth_api/v1/get_cur_point', {
      metadata: { addEncryptParams: true }
    })
  }

  /**
   * @desc 未收集的 Bug
   * @returns {Promise<*>}
   * [
   *   {
   *     bug_type: Number Bug 类型
   *     bug_time: Number 时间戳
   *   }
   * ]
   */
  getNotCollectBug() {
    return this.http.post('/user_api/v1/bugfix/not_collect', {})
  }

  /**
   * @desc 收集 Bug
   * @param bug_time
   * @param bug_type
   * @returns {Promise<*>}
   */
  collectBug({ bug_time = '', bug_type = '' } = {}) {
    return this.http.post('/user_api/v1/bugfix/collect', { bug_time, bug_type })
  }

  /**
   * @desc 矿石可兑换物品（带请求体，走真实浏览器）
   * 说明：该接口为 body-POST，juejin 的 secsdk anti-bot 要求真实浏览器上下文，
   *       axios 无法通过，故用 Playwright(系统 Edge) 完成；失败时回退到空 body 的 axios。
   */
  async getBenefitPage({ page_no = 1, page_size = 1000, type = 1, got_channel = 2 } = {}) {
    try {
      return await browserGetBenefitPage({
        cookie: this.http.cookie,
        page_no, page_size, type, got_channel,
      })
    } catch (e) {
      console.warn(`getBenefitPage(browser) 失败，回退空 body axios: ${e.message}`)
      return this.http.post('/growth_api/v1/get_benefit_page', '', {
        metadata: { addEncryptParams: true }
      })
    }
  }
}

module.exports = Api