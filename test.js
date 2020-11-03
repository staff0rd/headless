const playwright = require('playwright');
const path = require('path');
const scanner = require('fpScanner');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  for (const browserType of ['chromium']) {
    const browser = await playwright[browserType].launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
    });

    context.addInitScript(() => {
      Object.defineProperty(navigator, 'plugins', {
        get: () => [{mime: "application/pdf", name: "Chrome PDF Viewer", description: "", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai"}]
      });
    })
    const page = await context.newPage();
    
    page.route('**', route => {
      console.log(route.request().url());
      route.continue();
    });

    await page.goto('file://' + path.resolve('./html', 'test.html'), {
      waitUntil: 'load'
    });
    
    const fingerprint = await page.evaluate(async () => {
        return await fpCollect.generateFingerprint();
    });

    scannerResult = scanner.analyseFingerprint(fingerprint);
    Object.keys(scannerResult).forEach(key => {
      if (scannerResult[key].consistent !== 3) {
        console.log(JSON.stringify(scannerResult[key], null, 2));
      }
    })
    
    //console.log(JSON.stringify(scannerResult));

    
    
    //await page.goto('https://intoli.com/blog/making-chrome-headless-undetectable/chrome-headless-test.html');
    //await page.goto('https://arh.antoinevastel.com/bots/areyouheadless');
    //await page.goto('https://coachaustralia.com/');
    //await page.goto('https://hyatt.com/');
    //await page.goto('https://fingerprintjs.com/demo');
    //await page.goto('https://www.whatismybrowser.com/detect/what-is-my-user-agent');
    //await sleep(5000)
    
    console.log('webdriver: ' + await page.evaluate(() => JSON.stringify(navigator.webdriver)));
    console.log('navigator: ' + await page.evaluate(() => JSON.stringify(window.navigator)));
    console.log('check: ' + await page.evaluate(() => JSON.stringify(window.check)));
    console.log('plugins: ' + await page.evaluate(() => JSON.stringify(navigator.plugins)));
    
    await page.screenshot({ path: `example-${browserType}.png` });
    await browser.close();
  }
})();