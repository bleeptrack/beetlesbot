const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const BEETLESURL = 'https://beetles.bleeptrack.de/';
const BEETLEIMG = '/path/to/save';

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    var seed = req.query.seed;
    var pattern = req.query.pattern;
    var designnr = req.query.tshirt;
    
    console.debug(seed);
    console.debug(pattern);
    
    (async () => {
    let browseropts = {};
    if (!!process.env.CHROME_ARGS) {
        browseropts['args'] = process.env.CHROME_ARGS.split(' ');
    }
    const browser = await puppeteer.launch(browseropts);
    const page = await browser.newPage();
    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    //page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 2 });
    page.setViewport({ width: 1980, height: 1080, deviceScaleFactor: 2 });
    console.debug(`opening ${BEETLESURL}`);
    await page.goto(BEETLESURL+'?tshirt='+designnr+'&seed='+seed+'&pattern='+pattern, { waitUntil: 'networkidle2' });

    // from: https://gist.github.com/malyw/b4e8284e42fdaeceab9a67a9b0263743
    async function screenshotDOMElement(opts = {}) {
        const spath = 'path' in opts ? opts.path : null;
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
        spath,
        clip: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        },
        encoding: encoding,
        omitBackground: true
        });
    }

    console.debug(`getting image`);
    let imagedata_save = await screenshotDOMElement({ selector: '#shirt-container', encoding: 'binary' });

    // chrom*ium is not needed anymore
    await browser.close();
    
    //generate random filename
    let rndNumber = Math.floor(Math.random() * 999999999999); 
    let filename = 'beetle'+rndNumber+'.png';

    //save image
    console.debug('writing image to ' + filename );
    fs.writeFileSync(path.resolve(BEETLEIMG,filename), imagedata_save);

    res.send({ url: 'https://beetles.bleeptrack.de/beetleimg/'+filename});
        
    })();

    
});

app.listen(62846, function () {
  console.log('Example app listening on port 62846!');
}); 



 
