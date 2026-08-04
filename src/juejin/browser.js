// browser.js — 用 Playwright(Chromium/系统 Edge) 发 get_benefit_page
//
// 背景：get_benefit_page 是 body-POST，juejin 的 secsdk anti-bot 要求真实浏览器
// JS 执行上下文（a_bogus/CSRF/msToken 自动由页面 SDK 生成）。纯 axios/curl_cffi
// 无法通过，故本模块用真实浏览器内核完成这一个接口，其余签到流程仍走 axios。
//
// 浏览器选择：
//   - 默认用 Playwright 自带的 Chromium（适合 GitHub Actions / 无 Edge 环境，
//     需先 `npx playwright install --with-deps chromium`）
//   - 本地想用系统 Edge：传 { useSystemEdge: true }
const { chromium } = require('playwright');

const BENEFIT_URL = 'https://api.juejin.cn/growth_api/v1/get_benefit_page';

/**
 * 启动浏览器：
 *   - 默认用 Playwright 自带 Chromium（GitHub Actions / 无 Edge 环境）
 *   - 本地设 .env 的 USE_SYSTEM_EDGE=true，或传 { useSystemEdge: true } 用系统 Edge
 */
async function launchBrowser({ useSystemEdge } = {}) {
  const useEdge = useSystemEdge ?? process.env.USE_SYSTEM_EDGE === 'true';
  const baseArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
  if (useEdge) {
    return chromium.launch({ channel: 'msedge', headless: true, args: baseArgs });
  }
  return chromium.launch({ headless: true, args: baseArgs });
}

/**
 * 获取可兑换奖品列表（走真实浏览器）
 * @param {object} opts
 * @param {string} opts.cookie        juejin 登录 cookie（.env 的 COOKIE）
 * @param {number} [opts.page_no=1]
 * @param {number} [opts.page_size=1000]
 * @param {number} [opts.type=2]
 * @param {number} [opts.got_channel=2]
 * @param {number} [opts.timeout=45000]
 * @param {boolean} [opts.useSystemEdge=false]  本地有 Edge 时设 true，可省去装 Chromium
 * @returns {Promise<Array>} 奖品数组
 */
async function getBenefitPage({ cookie, page_no = 1, page_size = 1000, type = 2, got_channel = 2, timeout = 45000, useSystemEdge = false } = {}) {
  if (!cookie) throw new Error('getBenefitPage(browser): 缺少 cookie');

  const browser = await launchBrowser({ useSystemEdge });
  try {
    const context = await browser.newContext();
    // 注入 cookie
    const cookies = cookie
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf('=');
        return { name: p.slice(0, i).trim(), value: p.slice(i + 1), domain: '.juejin.cn', path: '/' };
      });
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto('https://juejin.cn/', { waitUntil: 'domcontentloaded', timeout });
    // 等页面 SDK(secsdk/bdms) 加载完成并完成 token 握手
    await page.waitForTimeout(2500);

    const result = await page.evaluate(
      async ({ url, body }) => {
        // web_id 从 localStorage 的 tea 缓存取（会话绑定的 web_id）
        let webId = '';
        try {
          const t = JSON.parse(localStorage.getItem('__tea_cache_tokens_2608') || '{}');
          webId = t.web_id || '';
        } catch (e) {}
        const fullUrl = `${url}?aid=2608&uuid=${webId}&spider=0`;
        const resp = await window.fetch(fullUrl, {
          method: 'POST',
          credentials: 'include', // 跨域带 cookie
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await resp.text();
        return { status: resp.status, text };
      },
      { url: BENEFIT_URL, body: { page_no, page_size, type, got_channel } }
    );

    let data;
    try {
      data = JSON.parse(result.text);
    } catch (e) {
      throw new Error(`getBenefitPage(browser): 响应非 JSON, HTTP=${result.status}, body=${result.text.slice(0, 120)}`);
    }
    if (data.err_no !== 0) {
      throw new Error(`getBenefitPage(browser): err_no=${data.err_no} msg=${data.err_msg}`);
    }
    return Array.isArray(data.data) ? data.data : [];
  } finally {
    await browser.close();
  }
}

module.exports = { getBenefitPage, launchBrowser };
