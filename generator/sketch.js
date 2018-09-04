var initseed = Array();
var initpattern = Array();
var b;

var shirtimg;
var shirturl;

var sC;
var pC;

var cycle = false;


function setup() {
    
  frameRate(10);

	var params = getURLParams();
    
        if ('seed' in params){
            
            initseed = JSON.parse("["+params['seed']+"]");
            sC = 0;
            
        }else{
            sC = -1;
        }
        
        if ('pattern' in params){
            
            initpattern = JSON.parse("["+params['pattern']+"]");
            pC = 0;
        }else{
            pC = -1;
        }

        //seed(parseInt(initseed));

        
        noLoop();
        

    b = new Beetle(pC, sC, initseed, initpattern);
    initseed = b.bugseed;
    initpattern = b.bugpattern;
    
    

    if ('tshirt' in params){
      
        if(parseInt(params['tshirt'])==1){
      
            var cropped = trimCanvas(b.canvas.canvas);
            b.canvas.remove();
        
            document.body.innerHTML = '<div id="shirt-container" class="container1"><div id="shirt-background"></div><div>';
            
            document.getElementById('shirt-container').appendChild(cropped);
            cropped.id = 'shirt-canvas';
            cropped.style.display = 'block';
            
            document.getElementById('shirt-background').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
            b.bg.remove();
        
            document.body.classList.add('shirt-body');
            
        }else if(parseInt(params['tshirt'])==2){
            
            
            var colorFaktor = new Array(5);
            colorFaktor = [ -100, -75, -50, -25, 0, 25, 50, 75, 100];
            
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
            oldColors = oldColors.slice(0,7);
            for(var i = 0; i<colorFaktor.length; i++){
                var c = oldColors.slice();
                c[0] = (c[0] + colorFaktor[i])%360;
                c[1] = (c[1] + colorFaktor[i])%360;
                console.log(c);
                colors.push(c);
                
            }
            
            for(var i = 0; i<seedFaktor.length; i++){
               var seed2 = b.stepVec(seedVector,seedFaktor[i], 0.5);
               seed2.splice(0,7);
               
               seeds.push(seed2);
            }
            for(var j = 0; j<patternFaktor.length; j++){
                var pattern2 = b.stepVecP(patternVector,patternFaktor[j], 0.09);
                pattern.push(pattern2);
            }
            
            //console.log(colors);
            
            document.body.innerHTML = '<div id="shirt-container" class="container2" ><div>';
            
            var bugs = Array();
            var maxW = 0;
            var maxH = 0;
            
            for(var i = 0; i<seedFaktor.length; i++){
               for(var j = 0; j<patternFaktor.length; j++){
                    //var b2 = new Beetle(0,0, colors[i+j].concat(seeds[i]), pattern[j]);
                    var s; 
                    var pat = Array();
                    var p = -1;
                    if(i==2 && j == 2){
                        s = b.bugseed.slice();
                        pat = b.bugpattern;
                        p = 0;
                        
                    }else{
                        s = b.stepVec(seedVector,seedFaktor[i], 0.2);
                    }
                    s.splice(0,7);
                    console.log(s);
                    var b2 = new Beetle(p, 0, colors[i+j].concat(s),  pat);
                    var c2 = trimCanvas(b2.canvas.canvas);
                    
                    bugs.push(c2);
                    
                    
                    
                    if(c2.width>maxW){
                        maxW = c2.width;
                    }
                    if(c2.height>maxH){
                        maxH = c2.height;
                    }
                    
                    b2.canvas.remove();
                    b2.bg.remove();
               }
            }
           
            var m;
           
            if(maxW>maxH){
               m = maxW;
            }else{
               m = maxH;
            }
           
            console.log(maxW+'  '+maxH+'   '+m+'  '+(280/m));
           
            for(var i = 0; i<bugs.length; i++){
                    
                    
                    
                    
                    var c2 = bugs[i];
                    
                    
                    c2.style.width = Math.round(c2.width*300/m)+'px';
                    c2.style.height = Math.round(c2.height*300/m)+'px';
                    
                    var d = document.createElement('div');
                    d.classList.add('singlebeetle');
                    d.appendChild(c2);
                    document.getElementById('shirt-container').appendChild(d);
                    c2.classList.add('rasterimg');
                    
               
            }
        
            //document.body.classList.add('shirt-body');
         }
        
        
    }else{


    // add background
    document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
    b.bg.remove();

    // extract and trim beetle
    var cropped = trimCanvas(b.canvas.canvas);
    b.canvas.remove();
    

    document.getElementById('beetle').appendChild(cropped);
    cropped.id = 'beetlecanvas';
    cropped.style.display = 'block';


        var div = document.getElementById('name');
        div.innerHTML = b.name;
        
        
        var buttons = document.getElementsByClassName('parambutton');

        for(var i = 0; i < buttons.length; i++) {
            this.elem = buttons[i];
            buttons[i].addEventListener('click', function(e){
                
                var set = e.target.nextSibling;
                
                
                set.style.display = (set.style.display === 'none' ? 'block' : 'none');
            });
        }

        updatePermalink();
        
        updateSliders();
    
    }
    
}

function toggleLoop(){
    console.log('toggle');
    var button = document.getElementById('cyclebutton');
    if(!cycle){
        loop();
        button.innerHTML = 'Stop Cycle';
    }else{
        document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
        b.bg.remove();
        noLoop();
        button.innerHTML = 'Cycle Bug';
    }
    cycle = !cycle;
}

function removeCanvas(){
    b.bg.remove();
     //b.canvas.canvas.parentElement.removeChild(b.canvas.canvas);
     //b.canvas.canvas.parentElement.removeChild(b.bgPattern.canvas);
     
    
    
}

function loadShop(){
    var script = document.createElement('script');
    script.src = "shopscript.js";
    document.body.innerHTML = '';
    document.body.appendChild(script);
}

function chooseDesign(){
    document.body.innerHTML = '<main><button onclick="createShirt(1)">Design 1</button><button onclick="createShirt(2)">Design 2</button></main>';
    
    
    history.pushState({}, null, 'https://beetles.bleeptrack.de?seed='+initseed.toString()+'&pattern='+initpattern.toString());
    history.pushState({}, null, 'https://beetles.bleeptrack.de/');
            
    window.addEventListener('popstate', function(event) {
        window.location.assign('https://beetles.bleeptrack.de?seed='+initseed.toString()+'&pattern='+initpattern.toString());
    });
    
}


function createShirt(designnr){
    console.log('fetching design '+designnr);
    getJSON('https://beetles.bleeptrack.de/shirtimg/?tshirt='+designnr+'&seed='+initseed.toString()+'&pattern='+initpattern.toString(),function(err, data) {
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

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function updateBug(renewPattern){

  if(renewPattern == false){    
    b = new Beetle(0,0, initseed, initpattern);
  }else{
    console.log("renew");
    b = new Beetle(-2,0, initseed, Array());
  }
  
  
 
  initseed = b.bugseed;
  initpattern = b.bugpattern;
  var cropped = trimCanvas(b.canvas.canvas);
  b.canvas.remove();
  var node = document.getElementById('beetle');
  node.removeChild(node.firstChild);
  node.appendChild(cropped);
  cropped.id = 'beetlecanvas';
  cropped.style.display = 'block';
  
  removeCanvas();
  
  
  updateSliders();
}




function updatePermalink(){
  var div = document.getElementById('seed');
  div.innerHTML = '<a href="https://beetles.bleeptrack.de?seed='+initseed.toString()+'&pattern='+initpattern.toString()+'">permalink</a>';
  
  var div = document.getElementById('name');
	div.innerHTML = b.name;
}



function changeColor(hex, id){
    var rgb = Array();
    hex = hex.replace(/#/, '');
    for (var i = 0; i < 6; i+=2) {
        rgb.push(parseInt(hex.substr(i,2),16));
    }
    console.log("rgb"+rgb);
    var r1 = rgb[0] / 255;
    var g1 = rgb[1] / 255;
    var b1 = rgb[2] / 255;
 
    var maxColor = Math.max(r1,g1,b1);
    var minColor = Math.min(r1,g1,b1);
    //Calculate L:
    var L = (maxColor + minColor) / 2 ;
    var S = 0;
    var H = 0;
    if(maxColor != minColor){
        //Calculate S:
        if(L < 0.5){
            S = (maxColor - minColor) / (maxColor + minColor);
        }else{
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if(r1 == maxColor){
            H = (g1-b1) / (maxColor - minColor);
        }else if(g1 == maxColor){
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        }else{
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }
 
    L = Math.floor(L * 100);
    S = Math.floor(S * 100);
    H = Math.floor(H * 60);
    console.log(H);
    if(H<0){
        H += 360;
    }
		
    
    if(id === "color1"){
        
        initseed[0] = H;
        initseed[3] = S;
        initseed[5] = L;
        
    }else if(id === "color2"){
        initseed[1] = H;
        initseed[4] = S;
        initseed[6] = L;
    }
    console.log(initseed);
		//return [(h*100+0.5)|0, ((s*100+0.5)|0) + '%', ((l*100+0.5)|0) + '%'];
        
    updateBug(false);
    updatePermalink();
    
    //update background because of changed color
    document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
    b.bg.remove();
}

function changeParam(newVal, name){
  console.log(name);
  var i = b.names.indexOf(name.toString());
  initseed[i]= parseInt(newVal);
  console.log(initseed);
  updateBug(false);
  updatePermalink();
  
  
  //window.location.href = 'https://beetles.bleeptrack.de?seed='+initseed.toString()+'&pattern='+initpattern.toString();
}

function changeParamP(newVal, name){
    console.log(name);
  var i = b.namesP.indexOf(name.toString());
  initpattern[i]= parseInt(newVal);
  console.log(initpattern);
  updateBug(false);
  
  document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
  b.bg.remove();
  
  updatePermalink();
  
  //console.log(initseed);
  //window.location.href = 'https://beetles.bleeptrack.de?seed='+initseed.toString()+'&pattern='+initpattern.toString();
}

function changePatternStyle(newVal){
  console.log("change pattern");
  if(typeof newVal !== 'undefined'){
    initpattern[0]= parseInt(newVal);
  }else{
    console.log("shuffle");
  }
  //patternCount = -1;
  //initpattern = Array();
  updateBug(true);
  
  document.getElementById('beetle').style.backgroundImage = 'url(' + b.bg.canvas.toDataURL() + ')';
  b.bg.remove();
  
  updatePermalink();
}

function updateSliders(){
    var colors = document.getElementById('colors');
    colors.innerHTML = '<label for="color1">Main Color: </label><input type="color" id="color1" name="color1" value="'+b.color1+'" onchange="changeColor(this.value, this.id)"/><br>';
    colors.innerHTML += '<label for="color2">Pattern Color: </label><input type="color" id="color2" name="color2" value="'+b.color2+'" onchange="changeColor(this.value, this.id)"/><br>';
    var feelers = document.getElementById('feelers');
    feelers.innerHTML = '';
    var body = document.getElementById('body');
    body.innerHTML = '';
    var feet = document.getElementById('feet');
    feet.innerHTML = '';
    var wing = document.getElementById('wing');
    wing.innerHTML = '';
    
    
    var paramsetP = document.getElementById('pattern');
    paramsetP.innerHTML = '<select onchange="changePatternStyle(this.value)">'
                        + '<option value="0"' + (b.patternvalue == 0 ? 'selected' : '') + '>Rings</option>'
                        + '<option value="1"' + (b.patternvalue == 1 ? 'selected' : '') + '>Dots</option>'
                        + '<option value="2"' + (b.patternvalue == 2 ? 'selected' : '') + '>Pattern</option>'
                        + '</select><button onclick="changePatternStyle()">shuffle</button><br>';
    
    createSliders();
    
}

function createSliders(){
    
    var colors = document.getElementById('colors');
    var feelers = document.getElementById('feelers');
    var body = document.getElementById('body');
    var feet = document.getElementById('feet');
    var wing = document.getElementById('wing');
    for(var i = 0; i<b.names.length; i++){
        if(typeof b.names[i] !== 'undefined' && b.names[i] != ""){
            var html = '<label for="'+b.names[i]+'">'+b.names[i]+'</label><br><input type="range" id="'+b.names[i]+'" name="'+b.names[i]+'" min="'+b.mins[i]+'" max="'+b.maxs[i]+'" value="'+b.bugseed[i]+'" onchange="changeParam(this.value, this.id)"/><br>';
            if(b.category[i] === "colors"){
                colors.innerHTML += html;
            }else if(b.category[i] === "feelers"){
                feelers.innerHTML += html;
            }else if(b.category[i] === "body"){
                body.innerHTML += html;
            }else if(b.category[i] === "feet"){
                feet.innerHTML += html;
            }else if(b.category[i] === "wing"){
                wing.innerHTML += html;
            }else{
                paramset.innerHTML += html;
            }
        }
    }
    
    var paramsetP = document.getElementById('pattern');
    for(var i = 0; i<b.namesP.length; i++){
        if(typeof b.namesP[i] !== 'undefined' && b.namesP[i] != ""){
            paramsetP.innerHTML += '<label for="'+b.namesP[i]+'">'+b.namesP[i]+'</label><br><input type="range" id="'+b.namesP[i]+'" name="'+b.namesP[i]+'" min="'+b.minsP[i]+'" max="'+b.maxsP[i]+'" value="'+b.bugpattern[i]+'" onchange="changeParamP(this.value, this.id)"/><br>';
        }
    }
}

function draw() {
    if(cycle){
        console.log('draw');
        initseed = b.step();
        initpattern = b.stepP();
        updateBug(false);
    }
    
    
}




















class Beetle{
    
    
/*var bugseed = Array();
*/

  	constructor(pC, sC, bS, bP){
        
        this.mins = Array();
        this.maxs = Array();
        this.names = Array();
        this.category = Array();


        
        this.minsP = Array();
        this.maxsP = Array();
        this.namesP = Array();
        
        this.patternCount = pC;
        this.seedCount = sC;
        this.bugpattern = bP;
        this.bugseed = bS;
     
      this.canvas = createGraphics(1500,1500);
      
     this.canvas.scale(2);
        
      //this.canvas.scale(2,2);
         //this.canvas.scale(3,3);
         
        

    	this.init();
    	this.draw();
    	this.generateName();
        
    }
    



    getImage(){
    	return this.canvas;
  	}

  	draw(){
    	this.canvas.strokeWeight(4);
    	this.canvas.fill(this.feetC);

      //background
      this.drawPattern();
     
      


      // finally remove the canvas
      this.wingPattern.remove();

      //center bug
      /*var antennamin = this.antennaL1.y;
      if(this.secondPart>=1){
        if(this.antennaL1.y>this.antennaL2.y){
          this.antennaL2.y;
        }
      }

      var diff = 250-((this.wingL.y-antennamin)/2);
      console.log(diff);*/

    	this.drawLegs();
    	this.canvas.noFill();
    	this.drawAntenna();
    	this.canvas.fill(this.headC);
    	this.drawHead();
    	this.canvas.fill(this.mainC);
    	this.drawBody();

    	this.drawWing();
  	}

  	init(){
  		this.attributes = new Array();
  		this.colors = new Array();

    	//colorMode(HSB, 360, 100, 100);
      colorMode(HSL, 360, 100, 100);

    	var mainr = this.rnd(0,360);
			//var wingr = mainr+rnd(0,200)-100;
      var wingr = this.rnd(0,360);


			var gradStep = this.rnd(3,8, "Color Balance", "colors");
            

			var s1 = this.rnd(0,100);
			var s2 = this.rnd(0,100);

      //var s1 = 85;
      //var s2 = 85;

			var b1 = this.rnd(0,100);
			var b2 = this.rnd(0,100);
            
            var rgb1 = this.hslToRgb(mainr/360,s1/100,b1/100);
            this.color1 = this.RGBtoHex(rgb1);
            var rgb2 = this.hslToRgb(wingr/360,s2/100,b2/100);
            this.color2 = this.RGBtoHex(rgb2);
      // console.log("b1: "+b1);
      // console.log("b2: "+b2);

    	this.colors.push(this.getColorName(mainr, s1, b1));

			var colo = this.calcGradient(mainr, s1, b1, wingr, s2, b2, gradStep);
			//var colo = calcGradient(mainr, 100,weightedRnd() , wingr, 100, 100, 6);
			// console.log(colo);


    	this.mainC = colo[1];

    	this.headC = colo[2];

    	this.feetC = colo[3];



    	this.wingsC1 = colo[0];

      var cname1 = this.getColorName(mainr, s1, b1);
      var cname2 = this.getColorName(wingr, s2, b2);
      this.colors.push(cname1);
      this.colors.push(cname2);
      


    	this.wingsC2 = color(wingr,s2,b2);



    	this.neck = createVector(500/2,100);
    	var neckoffX = this.rnd(5,70, "Neck Width", "body");
    	var neckoffY = this.rnd(20,70, "Neck Height", "body");

    	this.shoulderR = createVector(this.neck.x+neckoffX,this.neck.y+neckoffY);
    	this.shoulderL = createVector(this.neck.x-neckoffX,this.neck.y+neckoffY);
    	var bottomSize = this.rnd(150,350, "Body Length", "body");
    	this.bottom = createVector(this.neck.x,this.neck.y+bottomSize);

    	this.neckHandle = this.rnd(20,neckoffX, "Neck Curve", "body");
    	this.bottomHandle = this.rnd(20,100, "Bottom Curve", "body");


    	this.head = createVector(this.neck.x,this.neck.y);
    	this.headV = this.rnd(30,neckoffX, "Head Width", "body");
    	this.headH = this.rnd(10,50, "Head Height", "body");

    	var wingoff = this.rnd(0,neckoffY, "Wing Angle", "wing");
    	this.wingM = createVector(this.neck.x,this.shoulderL.y+wingoff);
    	var wingSize = this.rnd(50,330, "Wing Size", "wing");
    	var wingoffX = this.rnd(0,neckoffX*2, "Wing Tip Distance", "wing")-neckoffX;
    	this.wingL = createVector(this.shoulderL.x+wingoffX,this.shoulderL.y+wingSize);
    	this.wingR = createVector(this.shoulderR.x-wingoffX,this.shoulderR.y+wingSize);

    	this.wingHandleDown = this.rnd(5,60, "Wing Curve 1", "wing");
    	this.wingHandlePoint = this.rnd(5,neckoffX, "Wing Curve 2", "wing");
    	this.wingHandleShoulder = this.rnd(5,60, "Wing Curve 3", "wing");
    	this.wingHandleM = this.rnd(10,neckoffX, "Wing Curve 4", "wing");

	    if(this.wingL.y - this.bottom.y > 70){
	      this.attributes.push("Long-Winged");
	    }
	    if(this.bottom.y - this.wingL.y > 30){
	      this.attributes.push("Short-Winged");
	    }
	    if(this.bottom.y > 400){
	      this.attributes.push("Large");
	    }
	    if(this.bottom.y < 300 && this.neckoffX > 30 && this.wingL.y < 300){
	      this.attributes.push("Plump");
	      this.attributes.push("Small");
	    }
	    if(this.neckoffX<15 && this.bottomHandle<60){
	      this.attributes.push("Narrow");
	    }


      this.secondPart = this.rnd(0,1, "Feeler Segments", "feelers");

	    var antoffX = this.rnd(30,125, "Feeler Segment1 X", "feelers");
	    var antoffY = this.rnd(10,this.head.y-20, "Feeler Segment1 Y", "feelers");
        
        var antoffX2 = this.rnd(125,240, this.secondPart>0 ? "Feeler Segment2 X" : "", "feelers" );
        var antoffY2 = this.rnd(10,250, this.secondPart>0 ? "Feeler Segment2 Y" : "", "feelers");
        

	    this.antennaL1 = createVector(this.head.x-antoffX,antoffY);
	    this.antennaL2 = createVector(this.head.x-antoffX2,antoffY2);

	    this.antennaR1 = createVector(this.head.x+antoffX,antoffY);
	    this.antennaR2 = createVector(this.head.x+antoffX2,antoffY2);
	    this.antennaHandle = this.rnd(20,100);

	    this.legThickness = this.rnd(7,15, "Leg Thickness", "feet");
	    this.legLength = this.rnd(50,100, "Leg Length", "feet");

	    this.legAngleC1 = -this.rnd(15,45, "Leg Pair1 Angle1", "feet");
	    this.legAngleC2 = this.rnd(0,25, "Leg Pair1 Angle2", "feet");
	    this.legAngleC3 = this.rnd(30,50, "Leg Pair1 Angle3", "feet");

	    this.legAngle2C1 = this.rnd(30,80, "Leg Pair2 Angle1", "feet");
	    this.legAngle2C2 = this.rnd(30,80, "Leg Pair2 Angle2", "feet");
	    this.legAngle2C3 = this.rnd(20,45, "Leg Pair2 Angle3", "feet");

	    this.legAngle3C1 = -this.rnd(15,70, "Leg Pair3 Angle1", "feet");
	    this.legAngle3C2 = -this.rnd(15,70, "Leg Pair3 Angle2", "feet");
	    this.legAngle3C3 = -this.rnd(15,70, "Leg Pair3 Angle3", "feet");

	    this.legC1 = createVector(this.neck.x, this.shoulderL.y);
	    this.legC2 = createVector(this.neck.x, this.wingM.y);
	    this.legC3 = createVector(this.neck.x, this.bottom.y - (this.bottom.y-this.shoulderL.y)/2);

	    this.nbrFeet = this.rnd(2,6, "Number Feet End Segments", "feet");
	    if(this.nbrFeet>4){
	      this.attributes.push("Long-Legged");
	    }

  	}
  	
  	rndHidden(min, max) {
        var erg= Math.round(Math.random() * (max - min) ) + min;
        return erg;
    }

    rnd(min, max, name, cat) {
        this.mins.push(min);
        this.maxs.push(max);
        this.names.push(name);
        this.category.push(cat);
        if(this.seedCount == -1){
            var erg= Math.round(Math.random() * (max - min) ) + min;
            this.bugseed.push(erg);
            return erg;
        }else{
            //hier stand initseed - problem? 
            var erg = this.bugseed[this.seedCount];
            //console.log('bugseed: '+this.bugseed[this.seedCount]+' seedcount: '+this.seedCount);
            if(erg < min) erg = min;
            if(erg > max) erg = max;
            this.bugseed[this.seedCount] = erg;
            this.seedCount += 1;
            return erg;
        }
    }

    rndPattern(min, max, name, tmin, tmax) {
    
        if(typeof tmin === 'undefined'){
            this.minsP.push(min);
            this.maxsP.push(max);
        }else{
            this.minsP.push(tmin);
            this.maxsP.push(tmax);
        }
        this.namesP.push(name);
        if(this.patternCount == -1){
            
            var erg= Math.round(Math.random() * (max - min) ) + min;
            console.log(erg);
            this.bugpattern.push(erg);
            return erg;
        }else if(this.patternCount == -2){
            var erg = initpattern[0];
            if(erg < min) erg = min;
            if(erg > max) erg = max;
            this.bugpattern.push(erg);
            this.patternCount = -1;
            return erg;
        }else{
            //hier stand initpattern - problem?
            var erg = this.bugpattern[this.patternCount];
            if(erg < min) erg = min;
            if(erg > max) erg = max;
            //this.bugpattern.push(erg);
            this.bugpattern[this.patternCount] = erg;
            this.patternCount++;
            
            return erg;
        }
    }
  	
  	calcGradient(c11, c12, c13, c21, c22, c23, nbr){
        
        var s1 = 0;
        var s2 = 0;
        var s3 = 0;
    
        if(Math.abs(c21-c11) > 180){
            if(c21>c11){
                s1 = -((360+c11)-c21)/nbr;
                
            }else{
                s1 = (c11-(360+c21))/nbr;
                
            }
            
        }else{
            s1 = (c21-c11)/nbr;
        }
        
        
        s2 = (c22-c12)/nbr;
        s3 = (c23-c13)/nbr;
        var colors = Array();
        for(var i = 0; i<=nbr; i++){
            // console.log(c11 + s1*i, c12 + s2*i, c13 + s3*i);
            colors[i] = color((c11 + s1*i)%360, c12 + s2*i, c13 + s3*i);
        }
        
        //return shuffleArray(colors);
        return colors;
    }

	RGBtoHex(rgb){
        var r = this.toHex(rgb[0],2);
        var g = this.toHex(rgb[1],2);
        var b = this.toHex(rgb[2],2);
        return "#"+r+g+b;
    }

  	
  	getColorName(c, s, b){
        var rgb = this.hslToRgb(c/360,s/100,b/100);
        var n_match  = ntc.name(this.RGBtoHex(rgb));
        return n_match[1];
  	}
  	
  
  	
    toHex(rgb, fill) { 
        var hex = Number(rgb).toString(16);
       
        for(var i = 0; i<fill-hex.length; i++){
            hex = "0" + hex;
        }
        
        return hex;
    };
  	
    hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

  	drawHead(){
    	this.canvas.ellipse(this.head.x,this.head.y,this.headV,this.headH);
  	}

  	drawBody(){
    	this.canvas.beginShape();
    	this.canvas.vertex(this.neck.x, this.neck.y);
    	this.canvas.bezierVertex(this.neck.x+this.neckHandle, this.neck.y, this.shoulderR.x,this.shoulderR.y , this.shoulderR.x, this.shoulderR.y);
    	this.canvas.bezierVertex(this.shoulderR.x,this.shoulderR.y , this.bottom.x+this.bottomHandle,this.bottom.y, this.bottom.x, this.bottom.y);
    	this.canvas.bezierVertex(this.bottom.x-this.bottomHandle,this.bottom.y , this.shoulderL.x, this.shoulderL.y, this.shoulderL.x, this.shoulderL.y);
    	this.canvas.bezierVertex(this.shoulderL.x,this.shoulderL.y,this.neck.x-this.neckHandle, this.neck.y, this.neck.x, this.neck.y);
    	this.canvas.endShape();
  	}

  	drawAntenna(){
    	var end = this.rnd(0,2, "Feeler End Type", "feelers");

    	var param = this.rnd(3,6, end == 2? "Number Bristle Hairs" : end==1 ? "Circle Size" : "", "feelers");
    	var len = this.rnd(8,17, end==2 ? "Bristle Length" : "", "feelers");
    	this.canvas.bezier(this.head.x-(this.headV/4), this.head.y, this.head.x-(this.headV/4), this.head.y-30, this.antennaL1.x+this.antennaHandle, this.antennaL1.y, this.antennaL1.x, this.antennaL1.y);
    	this.canvas.bezier(this.head.x+(this.headV/4), this.head.y, this.head.x+(this.headV/4), this.head.y-30, this.antennaR1.x-this.antennaHandle, this.antennaR1.y, this.antennaR1.x, this.antennaR1.y);

    	if(this.secondPart >= 1){
      		this.canvas.bezier(this.antennaL1.x, this.antennaL1.y, this.antennaL1.x-this.antennaHandle, this.antennaL1.y, this.antennaL2.x, this.antennaL2.y, this.antennaL2.x, this.antennaL2.y);
      		this.canvas.bezier(this.antennaR1.x, this.antennaR1.y, this.antennaR1.x+this.antennaHandle, this.antennaR1.y, this.antennaR2.x, this.antennaR2.y, this.antennaR2.x, this.antennaR2.y);

	      	switch(end){
	        	case 1:
	          		this.canvas.ellipse(this.antennaR2.x,this.antennaR2.y,param*2,param*2);
	          		this.canvas.ellipse(this.antennaL2.x,this.antennaL2.y,param*2,param*2);
	          		break;
	        	case 2:
	          		for(var i = 1; i<=param; i++){
	            		var x = bezierPoint(this.antennaR1.x, this.antennaR1.x+this.antennaHandle, this.antennaR2.x, this.antennaR2.x, 1-(i*0.05));
	            		var y = bezierPoint(this.antennaR1.y, this.antennaR1.y, this.antennaR2.y, this.antennaR2.y, 1-(i*0.05));
	            		var tx = bezierTangent(this.antennaR1.x, this.antennaR1.x+this.antennaHandle, this.antennaR2.x, this.antennaR2.x, 1-(i*0.05));
	            		var ty = bezierTangent(this.antennaR1.y, this.antennaR1.y, this.antennaR2.y, this.antennaR2.y, 1-(i*0.05));
	            		var a = atan2(ty, tx);
	            		a -= HALF_PI;
	            		this.canvas.line(x, y, cos(a)*len + x, sin(a)*len + y);

	            		x = bezierPoint(this.antennaL1.x, this.antennaL1.x-this.antennaHandle, this.antennaL2.x, this.antennaL2.x, 1-(i*0.05));
	            		y = bezierPoint(this.antennaL1.y, this.antennaL1.y, this.antennaL2.y, this.antennaL2.y, 1-(i*0.05));
	            		tx = bezierTangent(this.antennaL1.x, this.antennaL1.x-this.antennaHandle, this.antennaL2.x, this.antennaL2.x, 1-(i*0.05));
	            		ty = bezierTangent(this.antennaL1.y, this.antennaL1.y, this.antennaL2.y, this.antennaL2.y, 1-(i*0.05));
	            		a = atan2(ty, tx);
	            		a -= HALF_PI;
	            		this.canvas.line(x, y, -cos(a)*len + x, -sin(a)*len + y);
	          		}
	          		break;
	      	}
	    }else{
	      	switch(end){
	        	case 1:
	          		this.canvas.ellipse(this.antennaR1.x,this.antennaR1.y,param,param);
	          		this.canvas.ellipse(this.antennaL1.x,this.antennaL1.y,param,param);
	          		break;
	        	case 2:
	          		for(var i = 1; i<=param; i++){
	            		var x = bezierPoint(this.head.x+(this.headV/4), this.head.x+(this.headV/4), this.antennaR1.x-this.antennaHandle, this.antennaR1.x, 1-(i*0.05));
	            		var y = bezierPoint(this.head.y, this.head.y-30, this.antennaR1.y, this.antennaR1.y, 1-(i*0.05));
	            		var tx = bezierTangent(this.head.x+(this.headV/4), this.head.x+(this.headV/4), this.antennaR1.x-this.antennaHandle, this.antennaR1.x, 1-(i*0.05));
	            		var ty = bezierTangent(this.head.y, this.head.y-30, this.antennaR1.y, this.antennaR1.y, 1-(i*0.05));
	            		var a = atan2(ty, tx);
	            		a -= HALF_PI;
	            		this.canvas.line(x, y, cos(a)*len + x, sin(a)*len + y);

	            		x = bezierPoint(this.head.x-(this.headV/4), this.head.x-(this.headV/4), this.antennaL1.x+this.antennaHandle, this.antennaL1.x, 1-(i*0.05));
	            		y = bezierPoint(this.head.y, this.head.y-30, this.antennaL1.y, this.antennaL1.y, 1-(i*0.05));
	            		tx = bezierTangent(this.head.x-(this.headV/4), this.head.x-(this.headV/4), this.antennaL1.x+this.antennaHandle, this.antennaL1.x, 1-(i*0.05));
	            		ty = bezierTangent(this.head.y, this.head.y-30, this.antennaL1.y, this.antennaL1.y, 1-(i*0.05));
	            		a = atan2(ty, tx);
	            		a -= HALF_PI;
	            		this.canvas.line(x, y, -cos(a)*len + x, -sin(a)*len + y);
	            		this.attributes.push("Bristle-Feelered");
	          		}
	         	 	break;
	      	}
	    }

	}



	drawLegs(){
    	this.canvas.push();
    	this.canvas.translate(this.legC1.x,this.legC1.y);
    	this.canvas.rotate(radians(this.legAngleC1));
    	this.canvas.rect(0,0,this.legLength, this.legThickness);

    	this.canvas.translate(this.legLength,0);
    	this.canvas.rotate(radians(this.legAngle2C1));
    	this.canvas.rect(0,0,this.legLength/2, this.legThickness);

    	this.canvas.translate(this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(this.legAngle3C1));

    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,10, this.legThickness/2, 10, -this.legThickness/2);
      		this.canvas.translate(10,0);
    	}
    	this.canvas.line(0,0, 10, -this.legThickness/3);
    	this.canvas.line(0,0, 10, this.legThickness/3);
    	this.canvas.pop();

    	this.canvas.push();
    	this.canvas.translate(this.legC1.x,this.legC1.y);
    	this.canvas.rotate(radians(-this.legAngleC1));
    	this.canvas.rect(0,0,-this.legLength, this.legThickness);

    	this.canvas.translate(-this.legLength,0);
    	this.canvas.rotate(radians(-this.legAngle2C1));
    	this.canvas.rect(0,0,-this.legLength/2, this.legThickness);

    	this.canvas.translate(-this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(-this.legAngle3C1));
    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,-10, this.legThickness/2, -10, -this.legThickness/2);
      		this.canvas.translate(-10,0);
    	}
    	this.canvas.line(0,0, -10, -this.legThickness/3);
    	this.canvas.line(0,0, -10, this.legThickness/3);
    	this.canvas.pop();

    	///////

    	this.canvas.push();
    	this.canvas.translate(this.legC2.x,this.legC2.y);
    	this.canvas.rotate(radians(this.legAngleC2));
    	this.canvas.rect(0,0,this.legLength, this.legThickness);

    	this.canvas.translate(this.legLength,0);
    	this.canvas.rotate(radians(this.legAngle2C2));
    	this.canvas.rect(0,0,this.legLength/2, this.legThickness);

    	this.canvas.translate(this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(this.legAngle3C2));

    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,10, this.legThickness/2, 10, -this.legThickness/2);
      		this.canvas.translate(10,0);
    	}
    	this.canvas.line(0,0, 10, -this.legThickness/3);
    	this.canvas.line(0,0, 10, this.legThickness/3);
    	this.canvas.pop();

    	this.canvas.push();
    	this.canvas.translate(this.legC2.x,this.legC2.y);
    	this.canvas.rotate(radians(-this.legAngleC2));
    	this.canvas.rect(0,0,-this.legLength, this.legThickness);

    	this.canvas.translate(-this.legLength,0);
    	this.canvas.rotate(radians(-this.legAngle2C2));
    	this.canvas.rect(0,0,-this.legLength/2, this.legThickness);

    	this.canvas.translate(-this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(-this.legAngle3C2));
    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,-10, this.legThickness/2, -10, -this.legThickness/2);
      		this.canvas.translate(-10,0);
    	}
    	this.canvas.line(0,0, -10, -this.legThickness/3);
    	this.canvas.line(0,0, -10, this.legThickness/3);
    	this.canvas.pop();

    	/////////

    	this.canvas.push();
    	this.canvas.translate(this.legC3.x,this.legC3.y);
    	this.canvas.rotate(radians(this.legAngleC3));
    	this.canvas.rect(0,0,this.legLength, this.legThickness);

    	this.canvas.translate(this.legLength,0);
    	this.canvas.rotate(radians(this.legAngle2C3));
    	this.canvas.rect(0,0,this.legLength/2, this.legThickness);

    	this.canvas.translate(this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(this.legAngle3C3));

    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,10, this.legThickness/2, 10, -this.legThickness/2);
      		this.canvas.translate(10,0);
    	}
    	this.canvas.line(0,0, 10, -this.legThickness/3);
    	this.canvas.line(0,0, 10, this.legThickness/3);
    	this.canvas.pop();

    	this.canvas.push();
    	this.canvas.translate(this.legC3.x,this.legC3.y);
    	this.canvas.rotate(radians(-this.legAngleC3));
    	this.canvas.rect(0,0,-this.legLength, this.legThickness);

    	this.canvas.translate(-this.legLength,0);
    	this.canvas.rotate(radians(-this.legAngle2C3));
    	this.canvas.rect(0,0,-this.legLength/2, this.legThickness);

    	this.canvas.translate(-this.legLength/2,this.legThickness/2);
    	this.canvas.rotate(radians(-this.legAngle3C3));
    	for(var i = 0; i < this.nbrFeet; i++){
      		this.canvas.triangle(0,0,-10, this.legThickness/2, -10, -this.legThickness/2);
      		this.canvas.translate(-10,0);
    	}
    	this.canvas.line(0,0, -10, -this.legThickness/3);
    	this.canvas.line(0,0, -10, this.legThickness/3);
    	this.canvas.pop();

  	}



  	drawPattern(){
        this.bgPattern = createGraphics(2200,1000);
        
        this.bgPattern.scale(2);
    	this.wingPattern = createGraphics(500 ,1000);
        
    	this.wingPattern.background(this.wingsC1);
    	this.wingPattern.noStroke();
        
    	this.bgPattern.background(this.wingsC1);
    	this.bgPattern.noStroke();
        
        

    	var choose = this.rndPattern(0,7);

    	if(choose<1){
            this.patternvalue = 0;
      		var tmp;
      		var diff = this.rndPattern(30,300, "Ring Size");


      		for(var r = 1000; r>30; r-=diff){
        		this.wingPattern.fill(this.wingsC1);
        		this.wingPattern.ellipse(this.wingM.x*2,this.wingM.y*2,r,r);
                this.bgPattern.fill(this.wingsC1);
        		this.bgPattern.ellipse(this.wingM.x,this.wingM.y,r,r);
        		tmp = this.wingsC1;
        		this.wingsC1 = this.wingsC2;
        		this.wingsC2 = tmp;
      		}
      		this.attributes.push("Ringed");
    	}else if(choose<2){
            this.patternvalue = 1;
      		this.wingPattern.fill(this.wingsC2);
            this.bgPattern.fill(this.wingsC2);
      		var r = this.rndPattern(5,40, "Circle Size");
      		var nbr = this.rndPattern(3,8);
      		for(var i = 0; i<nbr; i++){
        		this.wingPattern.ellipse(this.rndPattern(this.wingL.x*2-20,this.wingM.x*2),this.rndPattern(this.shoulderL.y*2,this.wingL.y*2),r,r);
                this.bgPattern.ellipse(this.rndPattern(this.wingL.x*2-20,this.wingM.x*2),this.rndPattern(this.shoulderL.y*2,this.wingL.y*2),r,r);
      		}
      		for(var i = 0; i<this.rndHidden(100,350); i++){
        		
                this.bgPattern.ellipse(this.rndHidden(0,2200),this.rndHidden(0,1000),r,r);
      		}
      		this.attributes.push("Dotted");
    	}else{
            this.patternvalue = 2;
      		this.wingPattern.push();
      		this.wingPattern.translate(0,-500);
            var angle = this.rndPattern(0,60, "Pattern Angle");
      		this.wingPattern.rotate(radians(angle));
      		this.wingPattern.stroke(this.wingsC2);
            this.bgPattern.push();
      		this.bgPattern.translate(100,-500);
      		this.bgPattern.rotate(radians(angle));
      		this.bgPattern.stroke(this.wingsC2);
      		var weight = this.rndPattern(10,100, "Pattern Weight");
      		this.wingPattern.strokeWeight(weight);
      		this.wingPattern.noFill();
            this.bgPattern.strokeWeight(weight);
      		this.bgPattern.noFill();
      		var lineHandle = this.rndPattern(0,100, "Pattern Curve");
      		var distx = this.rndPattern(50,200, "Pattern Distance X");
      		var disty = this.rndPattern(weight+10,200, "Pattern Distance Y");
      		var h1 = this.rndPattern(0,200, "Pattern Width");
      		var h2 = this.rndPattern(0,200, "Pattern Height");

      		for(var i = 0; i<1200; i+=disty){
        		for(var j = 0; j<1200; j+=distx*2){
          			this.wingPattern.bezier(j,h1+i,j+lineHandle,h1+i,j+distx-lineHandle,h2+i,j+distx,h2+i);
          			this.wingPattern.bezier(j+distx,h2+i,j+distx+lineHandle,h2+i,j+(distx*2)-lineHandle,h1+i,j+(distx*2),h1+i);
                    this.bgPattern.bezier(j,h1+i,j+lineHandle,h1+i,j+distx-lineHandle,h2+i,j+distx,h2+i);
          			this.bgPattern.bezier(j+distx,h2+i,j+distx+lineHandle,h2+i,j+(distx*2)-lineHandle,h1+i,j+(distx*2),h1+i);
        		}
      		}

      		this.wingPattern.pop();
            this.bgPattern.pop();
      		this.attributes.push("Striped");
    	}
    	
  	}

  	drawWing(){

    	var isTint = this.rndPattern(0,100, "Transparency Value", 0, 10);
    	if(isTint<10){
    		this.canvas.tint(255,255*isTint*0.1);
    	}

    	this.bg = createGraphics(1100,500);
        this.bg.tint(255,120);
        this.bg.image(this.bgPattern.get(),0,0,this.bgPattern.width/2,this.bgPattern.height/2 );
        this.bgPattern.remove();

    	var wingMaskL = createGraphics(500,1000);
        wingMaskL.scale(2);
    	wingMaskL.noStroke();

    	wingMaskL.beginShape();
    	wingMaskL.vertex(this.shoulderL.x, this.shoulderL.y);
    	wingMaskL.bezierVertex(this.shoulderL.x, this.shoulderL.y, this.wingM.x-this.wingHandleM,this.wingM.y , this.wingM.x, this.wingM.y);
    	wingMaskL.bezierVertex(this.wingM.x, this.wingM.y+this.wingHandleDown, this.wingL.x+this.wingHandlePoint, this.wingL.y, this.wingL.x, this.wingL.y);
    	wingMaskL.bezierVertex(this.wingL.x-this.wingHandlePoint, this.wingL.y, this.shoulderL.x-this.wingHandleShoulder, this.shoulderL.y+this.wingHandleShoulder,this.shoulderL.x, this.shoulderL.y);
    	wingMaskL.endShape();

    	
        
        var pattern = this.wingPattern.get();
    	var mask = wingMaskL.get();
        
    	pattern.mask(mask);
    	//this.canvas.image(pattern,100, 100,pattern.width/2, pattern.height/2);
        this.canvas.image(pattern,0,0,pattern.width/2, pattern.height/2);
        this.canvas.push();
        this.canvas.translate(500,0);
        this.canvas.scale(-1,1);
        this.canvas.image(pattern,0,0,pattern.width/2, pattern.height/2);
        this.canvas.pop();


      //wingMaskL.canvas.parentElement.removeChild(wingMaskL.canvas);
      //wingMaskL = null;
      wingMaskL.remove();
      

    	this.canvas.noTint();
    	this.canvas.noFill();
    	this.canvas.beginShape();
    	this.canvas.vertex(this.shoulderL.x, this.shoulderL.y);
    	this.canvas.bezierVertex(this.shoulderL.x, this.shoulderL.y, this.wingM.x-this.wingHandleM,this.wingM.y , this.wingM.x, this.wingM.y);
    	this.canvas.bezierVertex(this.wingM.x, this.wingM.y+this.wingHandleDown, this.wingL.x+this.wingHandlePoint, this.wingL.y, this.wingL.x, this.wingL.y);
    	this.canvas.bezierVertex(this.wingL.x-this.wingHandlePoint, this.wingL.y, this.shoulderL.x-this.wingHandleShoulder, this.shoulderL.y+this.wingHandleShoulder,this.shoulderL.x, this.shoulderL.y);
    	this.canvas.endShape();

    	this.canvas.beginShape();
    	this.canvas.vertex(this.shoulderR.x, this.shoulderR.y);
   		this.canvas.bezierVertex(this.shoulderR.x, this.shoulderR.y, this.wingM.x+this.wingHandleM, this.wingM.y , this.wingM.x, this.wingM.y);
   	 	this.canvas.bezierVertex(this.wingM.x, this.wingM.y+this.wingHandleDown, this.wingR.x-this.wingHandlePoint, this.wingR.y, this.wingR.x, this.wingR.y);
    	this.canvas.bezierVertex(this.wingR.x+this.wingHandlePoint, this.wingR.y, this.shoulderR.x+this.wingHandleShoulder, this.shoulderR.y+this.wingHandleShoulder,this.shoulderR.x, this.shoulderR.y);
    	this.canvas.endShape();
        
        
  	}

  	generateName(){

    	this.name = this.attributes[this.rnd(0,this.attributes.length-1)];
    	if(this.attributes.length>0){
      		this.name += ", "+this.colors[this.rnd(0,this.colors.length-1)]+"-Colored";
    	}

  	}
  	
  	step(){
        var newSeed = Array();
        for(var i = 0; i<this.bugseed.length; i++){
            var range = Math.round( (this.maxs[i]-this.mins[i])*0.03 );
            var x = this.bugseed[i] + this.rndHidden(0, range*2  ) - range;
            newSeed.push(x);
        }
        return newSeed;
    }
    
    stepVec(vector, faktor, changeFaktor){
        var newSeed = Array();
        for(var i = 0; i<this.bugseed.length; i++){
            var range = Math.round( (this.maxs[i]-this.mins[i])*changeFaktor );
            var x = this.bugseed[i] + (this.rndHidden(0, range*2  ) - range) * vector[i] * faktor;
            newSeed.push(x);
        }
        return newSeed;
    }
    
    stepP(){
        var newPattern = Array();
        for(var i = 0; i<this.bugpattern.length; i++){
            var range = Math.round( (this.maxsP[i]-this.minsP[i])*0.02 );
            var x = this.bugpattern[i] + this.rndHidden(0, range*2  ) - range;
            newPattern.push(x);
        }
        return newPattern;
    }
    
    stepVecP(vector, faktor, changeFaktor){
        var newPattern = Array();
        for(var i = 0; i<this.bugpattern.length; i++){
            var range = Math.round( (this.maxsP[i]-this.minsP[i])*changeFaktor );
            var x = this.bugpattern[i] + (this.rndHidden(0, range*2  ) - range) * vector[i] * faktor;
            newPattern.push(x);
        }
        return newPattern;
    }
    
    getStepVector(){
        var newVector = Array();
        for(var i = 0; i<this.bugseed.length; i++){
            var range = 1;
            var x =  this.rndHidden(0, range*2  ) - range;
            newVector.push(x);
        }
        return newVector;
    }
    
    getStepVectorP(){
        var newVector = Array();
        for(var i = 0; i<this.bugpattern.length; i++){
            var range = 1;
            var x =  this.rndHidden(0, range*2  ) - range;
            newVector.push(x);
        }
        return newVector;
    }
}
