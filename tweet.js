const puppeteer = require('puppeteer');
var Twit = require('twit');

const BEETLESURL = 'https://beetles.bleeptrack.de';
const ENABLE_TWEET = true;

var T = new Twit({
  consumer_key:         '',
  consumer_secret:      '',
  access_token:         '',
  access_token_secret:  '',
  timeout_ms:           30*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Adjustments particular to this page to ensure we hit desktop breakpoint.
  page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 2 });
  await page.goto(BEETLESURL, { waitUntil: 'networkidle2' });

  // from: https://gist.github.com/malyw/b4e8284e42fdaeceab9a67a9b0263743
  async function screenshotDOMElement(opts = {}) {
    const path = 'path' in opts ? opts.path : null;
    const selector = opts.selector;

    if (!selector) {
      throw Error('Please provide a selector.');
    }

    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element) {
        return null;
      }
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, selector);

    if (!rect) {
      throw Error(`Could not find element that matches selector: ${selector}.`);
    }

    return await page.screenshot({
      path,
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      encoding: 'base64'
    });
  }

  async function getText(selector) {
    return await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element) {
        return null;
      }
      return (element.innerText || '').trim();
    }, selector);
  }

  let name = await getText('#name');
  let seed = await getText('#seed');
  seed = seed.replace(/^#/, '');
  let b64image = await screenshotDOMElement({ selector: '#beetle' });

  // FIXME: add random word
  let tweetText = `${name}    seed:${seed} https://beetles.bleeptrack.de?seed=${seed}`;
  console.log(tweetText);

  // chrom*ium is not needed anymore
  await browser.close();

  if (!ENABLE_TWEET) {
    return;
  }

  // upload the media to Twitter
  let media = await T.post('media/upload', { media_data: b64image });
  let mediaIdStr = media.data.media_id_string;

  // add the metadata
  let altText = `Computer generated ${name} on a colorful background.`;
  let meta = await T.post('media/metadata/create', { media_id: mediaIdStr, alt_text: { text: altText } });

  // post the tweet
  let params = { status: tweetText, media_ids: [mediaIdStr] };
  await T.post('statuses/update', params);
})();