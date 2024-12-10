const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { proxyBase, proxyIPs } = require('./config');
const path = require('path');

(async () => {
  const browsers = [];

  for (let i = 0; i < proxyIPs.length; i++) {
    const ip = proxyIPs[i];

    // 构造完整的代理地址
    const rawProxy = `${proxyBase.protocol}://${proxyBase.username}:${proxyBase.password}@${ip}:${proxyBase.port}`;
    const anonymizedProxy = await proxyChain.anonymizeProxy(rawProxy);

    console.log(`Launching browser ${i + 1} with proxy: ${anonymizedProxy}`);

    // 为每个浏览器创建独立的 userDataDir
    const userDataDir = `./browser_profiles/profile_${i + 1}`;

    // 启动浏览器实例
    const browser = await puppeteer.launch({
      headless: false,
      args: [`--proxy-server=${anonymizedProxy}`],
      userDataDir,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // 打开对应的编号页面
    const htmlFilePath = `file://${path.resolve(__dirname, `pages/${i + 1}.html`)}`;
    await page.goto(htmlFilePath, { waitUntil: 'load' });

    console.log(`Browser ${i + 1} - Opened file: pages/${i + 1}.html`);

    browsers.push({ browser, anonymizedProxy }); // 存储浏览器与代理对应关系
  }

  console.log('All browsers launched with numbered pages. Press Ctrl+C to exit.');
})();
