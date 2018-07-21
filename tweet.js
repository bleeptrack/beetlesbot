const puppeteer = require('puppeteer');
const Twit = require('twit');
const fs = require('fs');

const BEETLESURL = 'https://beetles.bleeptrack.de';
const ENABLE_TWEET = process.env.ENABLE_TWEET || false;

var T;
if (ENABLE_TWEET) {
  T = new Twit({
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           30*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
  });
}

(async () => {
  let browseropts = {};
  if (!!process.env.CHROME_ARGS) {
    browseropts['args'] = process.env.CHROME_ARGS.split(' ');
  }
  const browser = await puppeteer.launch(browseropts);
  const page = await browser.newPage();
  // Adjustments particular to this page to ensure we hit desktop breakpoint.
  page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 2 });
  console.debug(`opening ${BEETLESURL}`);
  await page.goto(BEETLESURL, { waitUntil: 'networkidle2' });

  // from: https://gist.github.com/malyw/b4e8284e42fdaeceab9a67a9b0263743
  async function screenshotDOMElement(opts = {}) {
    const path = 'path' in opts ? opts.path : null;
    const encoding = 'encoding' in opts ? opts.encoding : 'base64';
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
      encoding: encoding
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

  console.debug(`getting name and seed`);
  let name = await getText('#name');
  let seed = await getText('#seed');
  seed = seed.replace(/^#/, '');

  console.debug(`getting image`);
  let imagedata = await screenshotDOMElement({ selector: '#beetle', encoding: (ENABLE_TWEET ? 'base64' : 'binary') });

  console.debug(`building full name`);
  const nouns = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'nouns.json'), 'utf8'));
  let word = nouns[Math.floor(Math.random()*nouns.length)];

  let type = 'bug';
  if (Math.random() < 0.5) {
    type = 'beetle';
  }

  let tweetText = `${name} ${word} ${type}   seed:${seed} ${BEETLESURL}?seed=${seed}`;
  console.log(tweetText);

  // chrom*ium is not needed anymore
  await browser.close();

  if (!ENABLE_TWEET) {
    console.debug(`writing image to beetle.png`);
    fs.writeFileSync('beetle.png', imagedata);
    return;
  }

  // upload the media to Twitter
  console.debug(`uploading image to twitter`);
  let media = await T.post('media/upload', { media_data: imagedata });
  let mediaIdStr = media.data.media_id_string;

  // add the metadata
  console.debug(`adding metadata to image`);
  let altText = `Computer generated ${name} on a colorful background.`;
  let meta = await T.post('media/metadata/create', { media_id: mediaIdStr, alt_text: { text: altText } });

  // post the tweet
  console.debug(`tweeting`);
  let params = { status: tweetText, media_ids: [mediaIdStr] };
  await T.post('statuses/update', params);
})();
