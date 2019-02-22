var initseed = Array();
var initpattern = Array();
var b;

var shirtimg;
var shirturl;

var sC = 0;
var pC = 0;

var cycle = false;

p5.disableFriendlyErrors = true; // disables FES

function setup() {

    frameRate(10);

    var params = getURLParams();

    if ('seed' in params) {

        initseed = JSON.parse("[" + params['seed'] + "]");
        sC = 0;

    } else {

        sC = -1;
    }

    if ('pattern' in params) {

        initpattern = JSON.parse("[" + params['pattern'] + "]");
        pC = 0;
    } else {
        pC = -1;
    }


    noLoop();


    b = new Beetle(pC, sC, initseed, initpattern);
    initseed = b.bugseed;
    initpattern = b.bugpattern;



    if ('tshirt' in params) {

        if (parseInt(params['tshirt']) == 0) {
            document.body.style.backgroundColor = "transparent";
            document.body.innerHTML = '<div id="shirt-container" class="container0" ><div>';


            var cropped = trimCanvas(b.canvas.canvas);
            b.canvas.remove();

            var m = cropped.height;
            if (cropped.height < cropped.width) {
                m = cropped.width;
            }

            var scale = 15;
            if ('scale' in params) {
                scale = parseInt(params['scale']);
            }
            cropped.style.width = Math.round(cropped.width * scale * 0.01) + 'px';
            cropped.style.height = Math.round(cropped.height * scale * 0.01) + 'px';


            b.bg.remove();

            var d = document.createElement('div');
            d.classList.add('singlebeetle0');
            d.appendChild(cropped);
            document.getElementById('shirt-container').appendChild(d);
            cropped.classList.add('rasterimg');
            cropped.id = 'sticker';

        } else if (parseInt(params['tshirt']) == 1) {
            document.body.style.backgroundColor = "transparent";
            var cropped = trimCanvas(b.canvas.canvas);
            b.canvas.remove();

            document.body.innerHTML = '<div id="shirt-container" class="container1"><div id="shirt-background"></div><div>';

            document.getElementById('shirt-container').appendChild(cropped);
            cropped.id = 'shirt-canvas';
            cropped.style.display = 'block';

            document.getElementById('shirt-background').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
            b.bg.remove();

            document.body.classList.add('shirt-body');

        } else if (parseInt(params['tshirt']) == 2) {

            document.body.style.backgroundColor = "transparent";
            var colorFaktor = new Array(5);
            colorFaktor = [-100, -75, -50, -25, 0, 25, 50, 75, 100];

            var seedFaktor = new Array(5);
            seedFaktor = [-4, -2, 1, 2, 4];

            var patternFaktor = new Array(5);
            patternFaktor = [-20, -10, 0, 10, 20];

            var seedVector = b.getStepVector();
            var patternVector = b.getStepVectorP();

            var seeds = new Array();
            var pattern = new Array();
            var colors = new Array();

            var oldColors = b.bugseed;
            oldColors = oldColors.slice(0, 7);
            for (var i = 0; i < colorFaktor.length; i++) {
                var c = oldColors.slice();
                c[0] = (c[0] + colorFaktor[i]) % 360;
                c[1] = (c[1] + colorFaktor[i]) % 360;
                colors.push(c);

            }

            for (var i = 0; i < seedFaktor.length; i++) {
                var seed2 = b.stepVec(seedVector, seedFaktor[i], 0.5);
                seed2.splice(0, 7);

                seeds.push(seed2);
            }
            for (var j = 0; j < patternFaktor.length; j++) {
                var pattern2 = b.stepVecP(patternVector, patternFaktor[j], 0.09);
                pattern.push(pattern2);
            }

            //console.log(colors);

            document.body.innerHTML = '<div id="shirt-container" class="container2" ><div>';

            var bugs = Array();
            var maxW = 0;
            var maxH = 0;

            for (var i = 0; i < seedFaktor.length; i++) {
                for (var j = 0; j < patternFaktor.length; j++) {
                    //var b2 = new Beetle(0,0, colors[i+j].concat(seeds[i]), pattern[j]);
                    var s;
                    var pat = Array();
                    var p = -1;
                    if (i == 2 && j == 2) {
                        s = b.bugseed.slice();
                        pat = b.bugpattern;
                        p = 0;

                    } else {
                        s = b.stepVec(seedVector, seedFaktor[i], 0.2);
                    }
                    s.splice(0, 7);

                    var b2 = new Beetle(p, 0, colors[i + j].concat(s), pat);
                    var c2 = trimCanvas(b2.canvas.canvas);

                    bugs.push(c2);



                    if (c2.width > maxW) {
                        maxW = c2.width;
                    }
                    if (c2.height > maxH) {
                        maxH = c2.height;
                    }

                    b2.canvas.remove();
                    b2.bg.remove();
                }
            }

            var m;

            if (maxW > maxH) {
                m = maxW;
            } else {
                m = maxH;
            }



            for (var i = 0; i < bugs.length; i++) {




                var c2 = bugs[i];


                c2.style.width = Math.round(c2.width * 300 / m) + 'px';
                c2.style.height = Math.round(c2.height * 300 / m) + 'px';

                var d = document.createElement('div');
                d.classList.add('singlebeetle');
                d.appendChild(c2);
                document.getElementById('shirt-container').appendChild(d);
                c2.classList.add('rasterimg');


            }

            //document.body.classList.add('shirt-body');
        }


    } else {


        // add background
        updateBackground();

        // extract and trim beetle
        var cropped = trimCanvas(b.canvas.canvas);
        b.canvas.remove();


        document.getElementById('beetle').appendChild(cropped);
        cropped.id = 'beetlecanvas';
        cropped.style.display = 'block';


        var buttons = document.getElementsByClassName('parambutton');

        for (var i = 0; i < buttons.length; i++) {

            buttons[i].addEventListener('click', function (e) {
                var set = e.target.nextSibling;
                var state = (set.style.display === 'none' ? 'block' : 'none');
                console.log(state);

                hideAll();




                set.style.display = state;
            });
        }

        updatePermalink();

        updateSliders();

    }

}

function hideAll() {
    var buttons = document.getElementsByClassName('parambutton');

    for (var i = 0; i < buttons.length; i++) {

        var set = buttons[i].nextSibling;


        set.style.display = 'none';

    }
}

function toggleLoop() {
    console.log('toggle');
    var button = document.getElementById('cyclebutton');
    if (!cycle) {
        document.getElementById('beetle').classList.add("paused");
        loop();
        button.innerHTML = '<img class="icon" alt="stop animate" src="icons8-delete-80.png">';
    } else {
        updateBackground();
        noLoop();
        document.getElementById('beetle').classList.remove("paused");
        button.innerHTML = '<img class="icon" alt="animate beetle" src="icons8-next-80.png">';
    }
    cycle = !cycle;
}

function loadShop() {
    var script = document.createElement('script');
    script.src = "shopscript.js";
    document.body.innerHTML = '';

    document.body.appendChild(script);
}

function makeNewBeetle() {
    b = new Beetle(-1, -1, Array(), Array());
    initseed = b.bugseed;
    initpattern = b.bugpattern;
    var cropped = trimCanvas(b.canvas.canvas);
    b.canvas.remove();
    var node = document.getElementById('beetle');
    node.removeChild(node.firstChild);
    node.appendChild(cropped);
    cropped.id = 'beetlecanvas';
    cropped.style.display = 'block';

    b.bg.remove();


    updateSliders();
    updatePermalink();
    updateBackground();
    history.pushState({}, null, 'https://beetles.bleeptrack.de/');
}

function saveBeetle() {
    history.pushState({}, null, 'https://beetles.bleeptrack.de?seed=' + initseed.toString() + '&pattern=' + initpattern.toString());

    window.addEventListener('popstate', function (event) {
        window.location.assign('https://beetles.bleeptrack.de?seed=' + initseed.toString() + '&pattern=' + initpattern.toString());
    });
}

function chooseDesign() {
    document.body.innerHTML = '<main><button onclick="createShirt(1)"><div class="dtext"><h1>Design 1</h1><p>your Beetle and a wing pattern background<p></div><img class="design" src="design1.png"></button><button onclick="createShirt(2)"><div class="dtext"><h1>Design 2</h1><p>a grid of 5x5 Beetles with yours at the center</p></div><img class="design" src="design2.png"></button></main>';


    history.pushState({}, null, 'https://beetles.bleeptrack.de?seed=' + initseed.toString() + '&pattern=' + initpattern.toString());
    history.pushState({}, null, 'https://beetles.bleeptrack.de/');

    window.addEventListener('popstate', function (event) {
        window.location.assign('https://beetles.bleeptrack.de?seed=' + initseed.toString() + '&pattern=' + initpattern.toString());
    });

}


function createShirt(designnr) {
    console.log('fetching design ' + designnr);
    document.body.innerHTML = '<main><div id="wait"><h1>Please hang on. Generating might take up to 30sec.</h1><div id="spinner"></div></div></main>';

    var cropped = trimCanvas(b.canvas.canvas);

    var node = document.getElementById('spinner');

    node.appendChild(cropped);
    cropped.id = 'beetlecanvas';
    cropped.style.display = 'block';


    getJSON('https://beetles.bleeptrack.de/shirtimg/?tshirt=' + designnr + '&seed=' + initseed.toString() + '&pattern=' + initpattern.toString(), function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            //alert('Your query count: ' + data.query.count);

            shirturl = data['url'];
            console.log(data['url']);

            loadShop();
        }
    });


}

var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

function updateBug(renewPattern) {

    if (renewPattern == false) {
        b = new Beetle(0, 0, initseed, initpattern);
    } else {
        console.log("renew");
        b = new Beetle(-2, 0, initseed, Array());
    }


    initseed = b.bugseed;
    initpattern = b.bugpattern;
    var cropped = trimCanvas(b.canvas.canvas);
    cropped.id = 'beetlecanvas';
    cropped.style.display = 'block';
    b.canvas.remove();
    var node = document.getElementById('beetle');
    node.removeChild(node.firstChild);
    node.appendChild(cropped);
    

    b.bg.remove();


    updateSliders();
    updatePermalink();
}




function updatePermalink() {
    var div = document.getElementById('name');
    div.innerHTML = b.name;

    var perm = document.getElementById('permalink');
    perm.innerHTML = 'http://beetles.bleeptrack.de/?seed=' + b.bugseed + '&pattern=' + b.bugpattern;
}



function changeColor(hex, id) {
    var rgb = Array();
    hex = hex.replace(/#/, '');
    for (var i = 0; i < 6; i += 2) {
        rgb.push(parseInt(hex.substr(i, 2), 16));
    }

    var r1 = rgb[0] / 255;
    var g1 = rgb[1] / 255;
    var b1 = rgb[2] / 255;

    var maxColor = Math.max(r1, g1, b1);
    var minColor = Math.min(r1, g1, b1);
    //Calculate L:
    var L = (maxColor + minColor) / 2;
    var S = 0;
    var H = 0;
    if (maxColor != minColor) {
        //Calculate S:
        if (L < 0.5) {
            S = (maxColor - minColor) / (maxColor + minColor);
        } else {
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if (r1 == maxColor) {
            H = (g1 - b1) / (maxColor - minColor);
        } else if (g1 == maxColor) {
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        } else {
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }

    L = Math.floor(L * 100);
    S = Math.floor(S * 100);
    H = Math.floor(H * 60);
    console.log(H);
    if (H < 0) {
        H += 360;
    }


    if (id === "color1") {

        initseed[0] = H;
        initseed[3] = S;
        initseed[5] = L;

    } else if (id === "color2") {
        initseed[1] = H;
        initseed[4] = S;
        initseed[6] = L;
    }

    //return [(h*100+0.5)|0, ((s*100+0.5)|0) + '%', ((l*100+0.5)|0) + '%'];

    updateBug(false);
    updatePermalink();

    //update background because of changed color
    updateBackground();
}

function changeParam(newVal, name) {
    console.log(name);
    var i = b.names.indexOf(name.toString());
    initseed[i] = parseInt(newVal);

    updateBug(false);
}

function changeParamP(newVal, name) {
    console.log(name);
    var i = b.namesP.indexOf(name.toString());
    initpattern[i] = parseInt(newVal);
    console.log(initpattern);
    updateBug(false);
    updateBackground();

}

function updateBackground() {
    document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
    b.bg.remove();
}



function changePatternStyle(newVal) {
    console.log("change pattern");
    if (typeof newVal !== 'undefined') {
        initpattern[0] = parseInt(newVal);
    } else {
        console.log("shuffle");
    }
    updateBug(true);

    updateBackground();


}

function updateSliders() {
    var colors = document.getElementById('colors');
    var feelers = document.getElementById('feelers');
    var body = document.getElementById('body');
    var feet = document.getElementById('feet');
    var wing = document.getElementById('wing');

    var colorsHtml = '';
    colorsHtml += '<label for="color1">Main Color: </label><input type="color" id="color1" name="color1" value="' + b.color1 + '" onchange="changeColor(this.value, this.id)"/></br>';
    colorsHtml += '<label for="color2">Pattern Color: </label><input type="color" id="color2" name="color2" value="' + b.color2 + '" onchange="changeColor(this.value, this.id)"/></br>';
    var feelersHtml = '';
    var bodyHtml = '';
    var feetHtml = '';
    var wingHtml = '';

    for (var i = 0; i < b.names.length; i++) {
        if (typeof b.names[i] !== 'undefined' && b.names[i] != "") {
            var html = '<label for="' + b.names[i] + '">' + b.names[i] + '</label><br><input type="range" id="' + b.names[i] + '" name="' + b.names[i] + '" min="' + b.mins[i] + '" max="' + b.maxs[i] + '" value="' + b.bugseed[i] + '" onchange="changeParam(this.value, this.id)"/><br>';
            if (b.category[i] === "colors") {
                colorsHtml += html;
            } else if (b.category[i] === "feelers") {
                feelersHtml += html;
            } else if (b.category[i] === "body") {
                bodyHtml += html;
            } else if (b.category[i] === "feet") {
                feetHtml += html;
            } else if (b.category[i] === "wing") {
                wingHtml += html;
            } else {
                //Undefined variable paramset
                //paramset.innerHTML += html;
            }
        }
    }

    colors.innerHTML = colorsHtml;
    feelers.innerHTML = feelersHtml;
    body.innerHTML = bodyHtml;
    feet.innerHTML = feetHtml;
    wing.innerHTML = wingHtml;

    var paramsetP = document.getElementById('pattern');
    var paramsetPHTML = '<select onchange="changePatternStyle(this.value)">'
        + '<option value="0"' + (b.patternvalue == 0 ? 'selected' : '') + '>Rings</option>'
        + '<option value="1"' + (b.patternvalue == 1 ? 'selected' : '') + '>Dots</option>'
        + '<option value="2"' + (b.patternvalue == 2 ? 'selected' : '') + '>Pattern</option>'
        + '</select><button onclick="changePatternStyle()">shuffle</button><br>';

    var paramsetP = document.getElementById('pattern');
    for (var i = 0; i < b.namesP.length; i++) {
        if (typeof b.namesP[i] !== 'undefined' && b.namesP[i] != "") {
            paramsetPHTML += '<label for="' + b.namesP[i] + '">' + b.namesP[i] + '</label><br><input type="range" id="' + b.namesP[i] + '" name="' + b.namesP[i] + '" min="' + b.minsP[i] + '" max="' + b.maxsP[i] + '" value="' + b.bugpattern[i] + '" onchange="changeParamP(this.value, this.id)"/><br>';
        }
    }

    paramsetP.innerHTML = paramsetPHTML;
}

function draw() {
    if (cycle) {
        console.log('draw');
        initseed = b.step();
        initpattern = b.stepP();
        updateBug(false);
    }


}




















