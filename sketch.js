function setup() {

	var params = getURLParams();

  var initseed = Math.floor(Math.random()*9999999999);

  if ('seed' in params){
    	initseed = params['seed'];
	}

	seed(parseInt(initseed));

	noLoop();

  var b = new Beetle();

  // add background
  document.getElementById('beetle').style.backgroundImage = 'url(' + b.bgcanvas.canvas.toDataURL() + ')';
  b.bgcanvas.canvas.parentElement.removeChild(b.bgcanvas.canvas);

  // extract and trim beetle
  var cropped = trimCanvas(b.canvas.canvas);
  b.canvas.canvas.parentElement.removeChild(b.canvas.canvas);

  document.getElementById('beetle').appendChild(cropped);
  cropped.id = 'beetlecanvas';
  cropped.style.display = 'block';

	var div = document.getElementById('name');
	div.innerHTML = b.name;

	var div = document.getElementById('seed');
	div.innerHTML = '<a href="https://beetles.bleeptrack.de?seed='+initseed+'">#'+initseed+'</a>';
}

function draw() {

}

////handle seeds
var m_w = 123456789;
var m_z = 987654321;

var maskrand = 0xffffffff;

// Takes any integer
function seed(i) {
  m_w = 987654321 + i;
	m_z = 123456789 - i;
}

function rnd(min, max) {

    //return Math.floor(Math.random() * (max - min) ) + min;
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & maskrand;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & maskrand;
    var result = ((m_z << 16) + m_w) & maskrand;

    result /= 4294967296;
    result += 0.5;


    var erg= Math.floor(result * (max - min) ) + min;

    return erg;
}

function weighting(x){
	return Math.round(-1.0/100.0 * x * x +100);
}

function weightedRnd(){
    var x = 100-rnd(0,100);
    //return weighting(100-weighting(x));
		return weighting(x);
}

function colStep(col, max){
	//col[0] = col[0] + rnd(0,2*max)-max;
	col[1] = col[1] + rnd(0,2*max)-max;
	col[2] = col[2] + rnd(0,2*max)-max;
}

function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function calcGradient(c11, c12, c13, c21, c22, c23, nbr){
	s1 = (c21-c11)/nbr;
	s2 = (c22-c12)/nbr;
	s3 = (c23-c13)/nbr;
	var colors = Array();
	for(var i = 0; i<=nbr; i++){
		// console.log(c11 + s1*i, c12 + s2*i, c13 + s3*i);
		colors[i] = color(c11 + s1*i, c12 + s2*i, c13 + s3*i);
	}
	//return shuffleArray(colors);
	return colors;
}




class Beetle{

  	constructor(){
      this.canvas = createGraphics(1500,1500);
      this.bgcanvas = createGraphics(750,500);

      //this.canvas.scale(2,2);
      this.canvas.scale(3,3);

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
      var pattern = this.wingPattern.get();
      this.bgcanvas.tint(255,50);
      this.bgcanvas.push();
      this.bgcanvas.scale(2);
      this.bgcanvas.image(pattern,0,0);
      this.bgcanvas.pop();
      this.bgcanvas.noTint();

      // finally remove the canvas
      this.wingPattern.canvas.parentElement.removeChild(this.wingPattern.canvas);

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

    	var mainr = rnd(0,360);
			//var wingr = mainr+rnd(0,200)-100;
      var wingr = rnd(0,360);


			var gradStep = rnd(4,8);

			var s1 = rnd(0,100);
			var s2 = rnd(0,100);

      //var s1 = 85;
      //var s2 = 85;

			var b1 = rnd(0,100);
			var b2 = rnd(0,100);
      // console.log("b1: "+b1);
      // console.log("b2: "+b2);

    	this.colors.push(this.getColorName(mainr, s1, b1));

			var colo = calcGradient(mainr, s1, b1, wingr, s1, b2, gradStep);
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
      


    	this.wingsC2 = colo[gradStep];



    	this.neck = createVector(500/2,100);
    	var neckoffX = rnd(5,70);
    	var neckoffY = rnd(20,70);

    	this.shoulderR = createVector(this.neck.x+neckoffX,this.neck.y+neckoffY);
    	this.shoulderL = createVector(this.neck.x-neckoffX,this.neck.y+neckoffY);
    	var bottomSize = rnd(150,350);
    	this.bottom = createVector(this.neck.x,this.neck.y+bottomSize);

    	this.neckHandle = rnd(20,neckoffX);
    	this.bottomHandle = rnd(20,100);


    	this.head = createVector(this.neck.x,this.neck.y);
    	this.headV = rnd(30,neckoffX);
    	this.headH = rnd(10,50);

    	var wingoff = rnd(0,neckoffY);
    	this.wingM = createVector(this.neck.x,this.shoulderL.y+wingoff);
    	var wingSize = rnd(50,350);
    	var wingoffX = rnd(0,neckoffX*2)-neckoffX;
    	this.wingL = createVector(this.shoulderL.x+wingoffX,this.shoulderL.y+wingSize);
    	this.wingR = createVector(this.shoulderR.x-wingoffX,this.shoulderR.y+wingSize);

    	this.wingHandleDown = rnd(5,60);
    	this.wingHandlePoint = rnd(5,neckoffX);
    	this.wingHandleShoulder = rnd(5,60);
    	this.wingHandleM = rnd(10,neckoffX);

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


      this.secondPart = rnd(0,2);

	    var antoffX = rnd(30,125);
	    var antoffY = rnd(10,this.head.y-20);
	    var antoffX2 = rnd(125,240);
	    var antoffY2 = rnd(10,250);

	    this.antennaL1 = createVector(this.head.x-antoffX,antoffY);
	    this.antennaL2 = createVector(this.head.x-antoffX2,antoffY2);

	    this.antennaR1 = createVector(this.head.x+antoffX,antoffY);
	    this.antennaR2 = createVector(this.head.x+antoffX2,antoffY2);
	    this.antennaHandle = rnd(20,100);

	    this.legThickness = rnd(7,15);
	    this.legLength = rnd(50,100);

	    this.legAngleC1 = -rnd(15,45);
	    this.legAngleC2 = rnd(0,25);
	    this.legAngleC3 = rnd(30,50);

	    this.legAngle2C1 = rnd(30,80);
	    this.legAngle2C2 = rnd(30,80);
	    this.legAngle2C3 = rnd(20,45);

	    this.legAngle3C1 = -rnd(15,70);
	    this.legAngle3C2 = -rnd(15,70);
	    this.legAngle3C3 = -rnd(15,70);

	    this.legC1 = createVector(this.neck.x, this.shoulderL.y);
	    this.legC2 = createVector(this.neck.x, this.wingM.y);
	    this.legC3 = createVector(this.neck.x, this.bottom.y - (this.bottom.y-this.shoulderL.y)/2);

	    this.nbrFeet = rnd(2,6);
	    if(this.nbrFeet>4){
	      this.attributes.push("Long-Legged");
	    }

  	}



  	getColorName(c, s, b){
        var rgb = this.hslToRgb(c/360,s/100,b/100);
        var r = this.toHex(rgb[0]);
        var g = this.toHex(rgb[1]);
        var b = this.toHex(rgb[2]);
        var n_match  = ntc.name("#"+r+g+b);
        return n_match[1];
  	}
  	
    toHex(rgb) { 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
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
    	var end = rnd(0,3);

    	var param = rnd(3,6);
    	var len = rnd(8,17);
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
    	this.wingPattern = createGraphics(500,500);
    	this.wingPattern.background(this.wingsC1);
    	this.wingPattern.noStroke();

    	var choose = rnd(0,8);

    	if(choose<1){
      		var tmp;
      		var diff = rnd(30,200);

      		for(var r = 700; r>30; r-=diff){
        		this.wingPattern.fill(this.wingsC1);
        		this.wingPattern.ellipse(this.wingM.x,this.wingM.y,r,r);
        		tmp = this.wingsC1;
        		this.wingsC1 = this.wingsC2;
        		this.wingsC2 = tmp;
      		}
      		this.attributes.push("Ringed");
    	}else if(choose<2){
      		this.wingPattern.fill(this.wingsC2);
      		var r = rnd(5,40);
      		var nbr = rnd(100,500);
      		for(var i = 0; i<nbr; i++){
        		this.wingPattern.ellipse(rnd(0,1000),rnd(0,1000),r,r);
      		}
      		this.attributes.push("Dotted");
    	}else{
      		this.wingPattern.push();
      		this.wingPattern.translate(0,-500);
      		this.wingPattern.rotate(radians(rnd(0,60)));
      		this.wingPattern.stroke(this.wingsC2);
      		var weight = rnd(4,60);
      		this.wingPattern.strokeWeight(weight);
      		this.wingPattern.noFill();
      		var lineHandle = rnd(0,100);
      		var distx = rnd(50,125);
      		var disty = rnd(weight,125);
      		var h1 = rnd(0,125);
      		var h2 = rnd(0,125);

      		for(var i = 0; i<1000; i+=disty){
        		for(var j = 0; j<1000; j+=distx*2){
          			this.wingPattern.bezier(j,h1+i,j+lineHandle,h1+i,j+distx-lineHandle,h2+i,j+distx,h2+i);
          			this.wingPattern.bezier(j+distx,h2+i,j+distx+lineHandle,h2+i,j+(distx*2)-lineHandle,h1+i,j+(distx*2),h1+i);
        		}
      		}

      		this.wingPattern.pop();
      		this.attributes.push("Striped");
    	}
  	}

  	drawWing(){

    	var isTint = rnd(1,10);
    	if(isTint==1){
    		this.canvas.tint(255, rnd(100,255));
    	}


    	var wingMaskL = createGraphics(500,500);
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
    	this.canvas.image(pattern,0,0);

    	var wingMaskR = createGraphics(1000,1000);

    	wingMaskR.beginShape();
    	wingMaskR.vertex(this.shoulderR.x, this.shoulderR.y);
    	wingMaskR.bezierVertex(this.shoulderR.x, this.shoulderR.y, this.wingM.x+this.wingHandleM, this.wingM.y , this.wingM.x, this.wingM.y);
    	wingMaskR.bezierVertex(this.wingM.x, this.wingM.y+this.wingHandleDown, this.wingR.x-this.wingHandlePoint, this.wingR.y, this.wingR.x, this.wingR.y);
    	wingMaskR.bezierVertex(this.wingR.x+this.wingHandlePoint, this.wingR.y, this.shoulderR.x+this.wingHandleShoulder, this.shoulderR.y+this.wingHandleShoulder,this.shoulderR.x, this.shoulderR.y);
    	wingMaskR.endShape();

    	pattern = this.wingPattern.get();
    	var patternFlip = createGraphics(1000,1000);
    	patternFlip.image(pattern, 0, 0);


    	patternFlip.push();
    	patternFlip.scale(-1.0, 1.0)
    	patternFlip.image(pattern, -500, 0);
    	patternFlip.pop();



    	mask = wingMaskR.get();
    	var flipped = patternFlip.get();
    	flipped.mask(mask);
    	this.canvas.image(flipped,0,0);

      wingMaskL.canvas.parentElement.removeChild(wingMaskL.canvas);
      wingMaskL = null;
      wingMaskR.canvas.parentElement.removeChild(wingMaskR.canvas);
      wingMaskR = null;
      patternFlip.canvas.parentElement.removeChild(patternFlip.canvas);
      patternFlip = null;

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

    	this.name = this.attributes[rnd(0,this.attributes.length)];
    	if(this.attributes.length>0){
      		this.name += ", "+this.colors[rnd(0,this.colors.length)]+"-Colored";
    	}

  	}
}
