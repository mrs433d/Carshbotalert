
const puppeteer = require('puppeteer');
const axios = require('axios');

const TELEGRAM_TOKEN = '7684954407:AAGFv-VuVedDNhZcgbhgCjVgEXIAkdj_b1k'; // <-- توکن ربات
const TELEGRAM_CHAT_ID = '-1002570608346'; // <-- Chat ID عددی

async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    });
  } catch (err) {
    console.error('خطا در ارسال به تلگرام:', err.message);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://takbet.com/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'saeedfm7@gmail.com', { delay: 100 });
    await page.type('input[name="password"]', 'Saeed14477', { delay: 100 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('با موفقیت وارد حساب شدید.');

    await page.goto('https://takbet.com/crash', { waitUntil: 'networkidle2' });
    console.log('در حال مانیتور کردن ضرایب...');

    let lastCrash = null;

    while (true) {
      try {
        const crash = await page.evaluate(() => {
          const el = document.querySelector('.crash-coefficient') || document.querySelector('.coefficient');
          return el ? el.textContent.trim() : null;
        });

        if (crash && crash !== lastCrash) {
          lastCrash = crash;
          const value = parseFloat(crash.replace('x', ''));
          const log = `[${new Date().toLocaleTimeString()}] ضریب: ${crash}`;
          console.log(log);
          if (value >= 4) {
            await sendToTelegram(`ضریب بالا تشخیص داده شد: ${crash}`);
          }
        }

        await delay(1000);
      } catch (err) {
        console.error('خطا در مانیتور کردن:', err.message);
      }
    }
  } catch (err) {
    console.error('خطای کلی:', err.message);
  }
}

startBot();
