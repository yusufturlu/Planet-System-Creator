
var 
	canvas,
	width,
	height,
	ctx;


var name,
	mass,
	objectType;

var bodies = [];
var predictBodies = [];
var ID = 100;
var envType = "Unknown";
var starType = "Unknown";

var sunMass = 1.989 * Math.pow(10, 6);
var earthMass = 5.972;
var moonMass = 7.35 * Math.pow(10, -2);

var timeElapse = 10;

var globalDt = 0.01

var mouse = new Mouse();
var addingAnObject = false;
var addingAnObjectType = 'none';
var settingVelocity = false;

var mouseOnButtonSound_1 = new Audio();
var mouseButtonClick = new Audio();

function setTimeElapse(toTimeElapse){
	timeElapse = toTimeElapse;
}

function init(){


	worker = new Worker('web-work.js');
	worker.addEventListener('message', drawPredictedPath);
	worker.addEventListener('error', workerError);
            
	mouseOnButtonSound_1.src = "mouseOnButton_1.mp3";

	mouseButtonClick.src = "mouseButtonClick.mp3";

	canvas = document.getElementById("canvas");
	width = window.innerWidth;
	height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext('2d');
	

	canvas.addEventListener('click', function(e) {
		checkClickOnObject();
		if(settingVelocity){
			settingVelocity = false;
			var velocity = Math.sqrt((Math.pow(mouse.lastClickX - mouse.x, 2) + Math.pow(mouse.lastClickY - mouse.y, 2)));
			velocity = velocity + 0.1;
			var angle = Math.acos( (Math.abs(mouse.lastClickX - mouse.x)) / velocity);
			if(addingAnObjectType == "Planet"){
 				var radius = (mass / earthMass) * 0.1 + 4;
				bodies.push(new Body(mouse.lastClickX, mouse.lastClickY, velocity, angle, mass, radius, false, name, addingAnObjectType, envType));	
			}else if(addingAnObjectType == "Moon"){
				var radius = (mass / moonMass) * 0.05 + 3;
				bodies.push(new Body(mouse.lastClickX, mouse.lastClickY, velocity, angle, mass, radius, false, name, addingAnObjectType));	
			}
			else if(addingAnObjectType == "Asteroid"){
				var radius = 2;
				bodies.push(new Body(mouse.lastClickX, mouse.lastClickY, velocity, angle, mass, radius, true, name, addingAnObjectType));	
			}

			var newBodyInfo = ""
			newBodyInfo += "<p" + bodies.length + " class='objectInfo' onmouseover='mouseOverSound()' onclick='showObj(" + bodies[bodies.length - 1].id + ")' >"; 
			newBodyInfo += "ID:" + bodies[bodies.length - 1].id + " - T:" + bodies[bodies.length - 1].type + " - N:" + bodies[bodies.length - 1].name + "</p" + bodies.length + ">";
  			document.getElementById("objectCreated").innerHTML += newBodyInfo;

		}
		mouse.updateLastClick();
		if(addingAnObject){

			addingAnObject = false;  

			if(addingAnObjectType == "Star"){
				var radius = (mass /  sunMass) * 0.2 + 5;
				bodies.push(new Body(mouse.lastClickX, mouse.lastClickY, 0, 0, mass, radius, false, name, "Star"));

			var newBodyInfo = ""
			newBodyInfo += "<p" + bodies.length + " class='objectInfo' onmouseover='mouseOverSound()' onclick='showObj(" + bodies[bodies.length - 1].id + ")' >"; 
			newBodyInfo += "ID:" + bodies[bodies.length - 1].id + " - T:" + bodies[bodies.length - 1].type + " - N:" + bodies[bodies.length - 1].name + "</p" + bodies.length + ">";
  			document.getElementById("objectCreated").innerHTML += newBodyInfo;
			}
			else
				settingVelocity = true;
			}

		if(!addingAnObject && !settingVelocity)
			closeNav();
		closeForm();

	});

	setInterval(function(){
		updateSystem();
		updateBodies(globalDt);
		ctx.clearRect(0,0,width,height);
		drawBodies();
		drawNewObject();
	},timeElapse);
	
	window.addEventListener('mousemove', function(e) {
	var rect = canvas.getBoundingClientRect();
	mouse.updateMousePosition(e.x - rect.left, e.y - rect.top);

});


}

function workerError(err){
	console.log(err.message, err.filename);
}


function mouseOverSound(){

	mouseOnButtonSound_1.play();
}



function pressSound(){
	mouseButtonClick.play();
}


function changeTimeElapse(){
	timeElapse = 10 + document.getElementById("timeIn").value;

}

function openForm(option) {
  pressSound();
  document.getElementById("StarFormDiv").style.display = "none";
  document.getElementById("PlanetFormDiv").style.display = "none";
  document.getElementById("MoonFormDiv").style.display = "none";
  document.getElementById("AsteroidFormDiv").style.display = "none";
  document.getElementById(option + "FormDiv").style.top = document.getElementById(option).offsetTop;
  document.getElementById(option + "FormDiv").style.display = "block";
}

function closeForm() {
  pressSound();
  document.getElementById("StarFormDiv").style.display = "none";
  document.getElementById("PlanetFormDiv").style.display = "none";
  document.getElementById("MoonFormDiv").style.display = "none";
  document.getElementById("AsteroidFormDiv").style.display = "none";
}


function openNav() {
	pressSound();
  	document.getElementById("leftMenu").style.width = "150px";
}

function closeNav() {
  pressSound();
  document.getElementById("StarFormDiv").style.display = "none";
  document.getElementById("PlanetFormDiv").style.display = "none";
  document.getElementById("MoonFormDiv").style.display = "none";
  document.getElementById("AsteroidFormDiv").style.display = "none";
  document.getElementById("leftMenu").style.width = "0";
}

function openObjectsInfo() {
  	pressSound();
 	document.getElementById("objectInfo").style.display = "none";
  	document.getElementById("objectInfo").style.width = "0px";
	document.getElementById("objectsInfo").style.display = "block";
	var bodiesInfo = "";
	for(var i = 0; i < bodies.length; i++){
		bodiesInfo += "<p" + (i + 1) + " class='objectInfo'  onmouseover='mouseOverSound()' onclick='showObj(" + bodies[i].id + "); pressSound();'>"; 
		bodiesInfo += "ID:" + bodies[i].id + " - T:" + bodies[i].type + " - N:" + bodies[i].name + "</p" + (i + 1) + ">";
	}
  	document.getElementById("objectCreated").innerHTML = bodiesInfo;
  	document.getElementById("objectsInfo").style.width = "250px";
}

function showObj(id){

	 var b;
	  for(var i = 0; i < bodies.length; i++){
	  	if(bodies[i].id == id){
	  		b = bodies[i];
	  		break;
	  	}
	  }
	var bodyInfo = "";
  	if(b.type == "Star")
		bodyInfo += " <img src='../objects_images/star.jpg' alt='Star' height='100' width='120'>";
  	if(b.type == "Planet")
		bodyInfo += " <img src='../objects_images/planet.jpg' alt='Star' height='100' width='120'>";
	if(b.type == "Moon")
  		bodyInfo += " <img src='../objects_images/moon.jpg' alt='Star' height='100' width='120'>";
  	if(b.type == "Asteroid")
  		bodyInfo += " <img src='../bbjects_images/asteroid.jpg' alt='Star' height='100' width='120'>";

	bodyInfo += "<header> <h1>" + b.type + "</h1></header>";
	bodyInfo += "<article id='objectCreated'>";
	bodyInfo += "<p1><b>ID:</b> " + b.id + "</p1><br>";
	bodyInfo += "<p2><b>Name:</b> " + b.name + "</p2><br>";
	if(b.type == "Star"){
		bodyInfo += "<p3><b>Mass:</b> " + (b.m * 1.989 * Math.pow(10,24)) + "[kg]</p3><br>";
	}else if(b.type == "Planet"){
		bodyInfo += "<p3><b>Mass:</b> " + (b.m *  5.972 * Math.pow(10,24)) + "[kg]</p3><br>";
	}else if(b.type == "Moon"){
		bodyInfo += "<p3><b>Mass:</b> " + (b.m *  7.35  * Math.pow(10,24)) + "[kg]</p3><br>";
	}else if(b.type == "Asteroid"){
		bodyInfo += "<p3><b>Mass:</b> " + (b.m * 1000) + "[kg]</p3><br>";
	}else{
		bodyInfo += "<p3><b>Mass:</b> Unknown </p3><br>";

	}
	if(b.type == "Planet"){
		bodyInfo += "<p4><b>Distance to star:</b>" + findNearestStar(b) + "[km]</p4><br>";
		bodyInfo += "<p5><b>Planet type: </b>"+ b.enviromentType +"</p5><br>";
	}
	bodyInfo += "</article><br>";
	 
	bodyInfo += " <button type='button' class='btn ' onmouseover='mouseOverSound()' onclick='openObjectsInfo()'>Show All</button><br>"
	bodyInfo += " <button type='button' class='btn delete' onmouseover='mouseOverSound()' onclick='delBody(" + b.id + "); pressSound(); openObjectsInfo()'>Delete Object</button>"
	document.getElementById("objectsInfo").style.display = "none";
	document.getElementById("objectInfo").style.display = "block";
	document.getElementById("objectInfo").style.width = "250px";
	document.getElementById("objectInfo").innerHTML = bodyInfo;

}

function closeObjectsInfo() {
  	pressSound();
	document.getElementById("objectsInfo").style.width = "0";
}

function toClonableData(){

	for(var i = 0; i < bodies.length; i++){
		predictBodies.push({
			'x' : bodies[i].x,
			'y' : bodies[i].y,

			'vy' : bodies[i].vy,
			'vx' : bodies[i].vx,

			'ax' : bodies[i].ax,
			'ay' : bodies[i].ay,

			'm' : bodies[i].m
		});
	}

}

function drawNewObject(){
	if(addingAnObject){
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 20, 0, 6.28);			
		ctx.fillStyle =  "#283659";
		ctx.fill();
		ctx.closePath();
	}else if(settingVelocity){
		ctx.beginPath();
		ctx.arc(mouse.lastClickX, mouse.lastClickY, 20, 0, 6.28);
		ctx.fillStyle =  "#283659";
		ctx.fill();	
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(mouse.lastClickX, mouse.lastClickY);
		ctx.lineWidth = "5";
		ctx.strokeStyle = "green";

		ctx.lineTo(mouse.x, mouse.y);
		ctx.stroke();
		ctx.closePath();
		predictBodies = [];	
		toClonableData();
		var velocity = Math.sqrt((Math.pow(mouse.lastClickX - mouse.x, 2) + Math.pow(mouse.lastClickY - mouse.y, 2))) + 0.001;
		var angle = Math.acos( (Math.abs(mouse.lastClickX - mouse.x)) / velocity);

	if(mouse.x < mouse.lastClickX)
		var vx = -(velocity * Math.cos(angle));
	else
		var vx = velocity * Math.cos(angle);

	if(mouse.y < mouse.lastClickY)
		var vy = -(velocity * Math.sin(angle));
	else	
		var vy = velocity * Math.sin(angle);

		predictBodies.push({
			'x' : mouse.lastClickX,
			'y' : mouse.lastClickY,

			'vy' : vy,
			'vx' : vx,

			'ax' : 0.001,
			'ay' : 0.001,

			'm' : mass

		});
        worker.postMessage(predictBodies);

	}

}

function addBody(type) {

	pressSound();
	document.getElementById(type + "FormDiv").style.display = "none";
	addingAnObjectType = type; 

	var objectData = document.getElementById(type + "Form").elements; 
	if(addingAnObjectType == "Star"){
		name = objectData[0].value;
		mass = sunMass * objectData[1].value;
		if(mass == "None")
			mass = 0.001;

	}else if(addingAnObjectType == "Planet"){
		name = objectData[0].value;
		mass = earthMass * objectData[1].value;
		if(mass == "None")
			mass = 0.001;
		envType = objectData[2].value;
	}else if(addingAnObjectType == "Moon"){
		name = objectData[0].value;
		mass = moonMass * objectData[1].value;
		if(mass == "None")
			mass = 0.001;
	}else if(addingAnObjectType == "Asteroid"){
		name = objectData[0].value;
		mass = objectData[1].value;
		if(mass == "None")
			mass = 0.001;
	}

	addingAnObject = true;
  }


function drawBodies(){
	for(var i = 0;i < bodies.length;i++)
		bodies[i].draw(ctx);
}

function updateBodies(dt){
	for(var i = 0;i < bodies.length;i++)
		bodies[i].update(dt);
}

function delBody(toDeleteBodyID){
	for( var i = 0; i < bodies.length; i++){ 
		if ( bodies[i].id === toDeleteBodyID) {
				bodies.splice(i, 1); 
				for(var i = 0; i < bodies.length; i++){
					delFromDistArray(toDeleteBodyID);
				}
			}
		}
}

function delFromDistArray(toDeleteDistID){
	for(var i = 0; i < bodies.length; i++){
		for(var j = 0; j < bodies[i].distArr.length; j++){
			if(bodies[i].distArr[j].to.id == toDeleteDistID){
				bodies[i].distArr.splice(j, 1);
			}
		}
	}
}

function checkIfHasDist(b1, b2){
	for(var i = 0; i < b1.distArr.length; i++){
		if (b1.distArr[i].to.id == b2.id);
			return true;
	}
	return false;
}

function updateDistance(b1, b2, dist){
	for(var i = 0; i < b1.distArr.length; i++){
		if(b1.distArr[i].to.id == b2.id)
			b1.distArr[i].dist = dist;
	}
}


function updateSystem(){
	// var G = 6.67408 * Math.pow(10, 1);
	var G = 1;

	var colidingObjects = [];
	var preventFromDeleting = [];

 	for(var i = 0 ; i < bodies.length; i++)
		for(var j = 0; j < bodies.length; j++){
			if(i == j) continue;

			var b1 = bodies[i];
			var b2 = bodies[j];
			
			var dist = Math.sqrt(
				(b1.x - b2.x)*(b1.x - b2.x) + 
				(b1.y - b2.y)*(b1.y - b2.y)
			);

			var nx = (b2.x - b1.x) / dist;
			var ny = (b2.y - b1.y) / dist;

			dist = dist * 2;
			if(!checkIfHasDist(b1, b2))
				b1.distArr.push(new Distance(b2, dist));
			else
				updateDistance(b1, b2, dist);


			if((b1.radius + b2.radius + 2) > dist){
				if(b1.m === b2.m){
					preventFromDeleting.push(b1.id);

					if(!preventFromDeleting.includes(b2.id))
						colidingObjects.push(b2.id);
				}
				else if(b1.m > b2.m){
					if(!preventFromDeleting.includes(b2.id)){
						colidingObjects.push(b2.id);
					}
				}
				else{
					if(!preventFromDeleting.includes(b1.id)){
						colidingObjects.push(b1.id);
					}
				}
			}

			var force = G * (b1.m * b2.m) / (dist * dist);
			
			b1.ax += nx * force / b1.m;
			b1.ay += ny * force / b1.m;
			
			b2.ax -= nx * force / b2.m;
			b2.ay -= ny * force / b2.m;
			
	}
	for(var i = 0; i < colidingObjects.length; i++){
		delBody(colidingObjects[i]);
	}
}



function Mouse(){
	this.x = 0;
	this.y = 0;
	this.lastClickX = 0;
	this.lastClickY = 0;

	this.updateMousePosition = function(x, y){
		this.x = x;
		this.y = y;
	}

	this.updateLastClick = function(){
		this.lastClickX = this.x;
		this.lastClickY = this.y;
	}

}

function checkClickOnObject(){
	for(var i = 0; i < bodies.length; i++){
		if(mouse.lastClickX <= (bodies[i].x + bodies[i].radius + 20) && mouse.lastClickX >= (bodies[i].x - bodies[i].radius - 20) && 
		mouse.lastClickY <= (bodies[i].y + bodies[i].radius + 20) && mouse.lastClickY >= (bodies[i].y - bodies[i].radius - 20) && 
		settingVelocity == false && 
		addingAnObject == false){
			showObj(bodies[i].id);
		}
	}
}

function Distance(to, dist){
	this.to = to;
	this.dist = dist;
}

function findNearestStar(toPlanet){
	var closest = Math.pow(10, 30);
	for(var i = 0; i < toPlanet.distArr.length; i++){
		if(toPlanet.distArr[i].to.type == "Star" && 
			toPlanet.distArr[i].dist < closest)
			closest = toPlanet.distArr[i].dist;
	}
	return closest;
}

function Body(x,y,v,angle,mass,radius,hasTail, name="None", type="Unknown", enviromentType){
	this.x = x;
	this.y = y;
	this.id = ID;
	ID += 1;
	this.enviromentType = enviromentType;
	if(mouse.x < mouse.lastClickX)
		this.vx = -(v * Math.cos(angle));
	else
		this.vx = v * Math.cos(angle);

	if(mouse.y < mouse.lastClickY)
		this.vy = -(v * Math.sin(angle));
	else	
		this.vy = v * Math.sin(angle);

	this.m = mass;
	this.radius = radius;
	this.ax = 0;
	this.ay = 0;
	this.name = name;
	this.type = type;
	
	this.distArr = [];

	if(hasTail)
		this.tail = new Tail(40);
	this.tailCounter = 0;
	this.tailLimit = 3;
	
	
	this.update = function(dt){
		this.vx += this.ax * dt;
		this.vy += this.ay * dt;
		
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		
		this.ax = 0;
		this.ay = 0;
		
		if(this.tail){
			if(this.tailCounter > this.tailLimit){
				this.tailCounter -= this.tailLimit;
				this.tail.addPoint({x:this.x,y:this.y});
			}
			else
				this.tailCounter++;
		}
		
	};

	this.draw = function(ctx){
		ctx.beginPath();

		if(this.type == "Star"){
	
			ctx.fillStyle =  "#283659";
			ctx.arc(this.x,this.y,this.radius + (this.radius * 0.5), 0, 6.28);			
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.arc(this.x,this.y,this.radius + this.radius * 0.1, 0, 6.28);
			ctx.fillStyle = "#FDD017";
			ctx.fill();

			ctx.closePath();
			ctx.beginPath();

			ctx.arc(this.x,this.y,this.radius, 0, 6.28);

			if(this.m <= (0.3 * sunMass)){
				ctx.fillStyle = "#FF689B";
				ctx.fill();
			}else if(this.m > (0.3 * sunMass) && this.m <= (0.8 * sunMass) ){
				ctx.fillStyle = "#FB9900";
			}else if(this.m > (0.8 * sunMass) && this.m <= (1.1 * sunMass) ){
				ctx.fillStyle = "#FFFECE";
			}else if(this.m > (1.1 * sunMass) && this.m <= (1.7 * sunMass) ){
				ctx.fillStyle = "#CECAFF";
			}else{
				ctx.fillStyle =  "#34FEFE";
			}

			// ctx.fillStyle = "#FFA62F";
			ctx.fill();
			ctx.arc(this.x,this.y,this.radius + this.radius * 0.1, 0, 6.28);
		}
		else if (this.type == "Planet"){
			ctx.arc(this.x,this.y,this.radius, 0, 6.28);

			if(this.enviromentType == "Habitant")
				ctx.fillStyle = "#00CED1";
			else if(this.enviromentType == "Rocky"){
				ctx.fillStyle = "#8B4513";
			}
			else if(this.enviromentType == "Gaseous"){
				ctx.fillStyle = "#FFA07A";
			}else if(this.enviromentType == "Lava Planet"){
				ctx.fillStyle = "#B22222";
			}else if(this.enviromentType == "Ice Planet"){
				ctx.fillStyle = "#F0F8FF";
			}else if(this.enviromentType == "Desert Planet"){
				ctx.fillStyle = "#F0E68C";
			}else if(this.enviromentType == "Ring Planet"){
				ctx.beginPath();
				ctx.arc(this.x,this.y,this.radius + this.radius * 0.1 + 2, 0, 6.28);
				ctx.strokeStyle = "#FFD700";
				ctx.lineWidth = 1 + this.radius * 0.1;
				ctx.stroke();
				ctx.beginPath();
				ctx.fillStyle = "#FFA07A";
				ctx.arc(this.x,this.y,this.radius, 0, 6.28);

			}
			else
				ctx.fillStyle = "#8B4513";

			ctx.fill();
		}else{
			ctx.arc(this.x,this.y,this.radius, 0, 6.28);
			ctx.fillStyle = "#B6B6B4";
			ctx.fill();
		}

		if(mouse.x <= (this.x + this.radius + 20) && mouse.x >= (this.x - this.radius - 20) && 
			mouse.y <= (this.y + this.radius + 20) && mouse.y >= (this.y - this.radius - 20)){


			ctx.fillStyle = "#A9A9A9";
			ctx.font="10px Arial";
			ctx.fillText("Type: " + this.type, this.x + this.radius + 4, this.y + this.radius - 15);
			ctx.fillText("Name: " + this.name, this.x + this.radius + 4, this.y + this.radius);

			if(this.type == "Star"){
				ctx.fillText("Mass: " + this.m *  1.989 * Math.pow(10,24), this.x + this.radius + 4, this.y + this.radius + 15);
			}else if(this.type == "Planet"){
				ctx.fillText("Mass: " + this.m *  5.972 * Math.pow(10,24), this.x + this.radius + 4, this.y + this.radius + 15);
			}else if(this.type == "Moon"){
				ctx.fillText("Mass: " + this.m *  7.35  * Math.pow(10,24), this.x + this.radius + 4, this.y + this.radius + 15);
			}else if(this.type == "Asteroid"){
				ctx.fillText("Mass: " + this.m *  1000, this.x + this.radius + 4, this.y + this.radius + 15);
			}
			if(this.type == "Planet"){
				var nearestStar = findNearestStar(this);

				ctx.fillText("DistToStar: " + nearestStar.toPrecision(7) + "e+6 km", this.x + this.radius + 4, this.y + this.radius + 30);
			}
		}
		ctx.closePath();
		if(this.tail)
			this.tail.draw(ctx);
	};
}

function Tail(maxLength){
	this.points = [];
	this.maxLength = maxLength;
	this.addPoint = function(point){
		
		for(var i = Math.min(maxLength,this.points.length);i > 0;i--)
			this.points[i] = this.points[i - 1];
		
		this.points[0] = point;
	};
	this.draw = function(ctx){
		for(var i = 1; i < Math.min(this.maxLength,this.points.length);i++){
			
			if(i < this.maxLength - 20)
				ctx.globalAlpha = 1;
			else
				ctx.globalAlpha = (this.maxLength - i) / 20;
			
			ctx.beginPath();
			ctx.moveTo(this.points[i - 1].x,this.points[i - 1].y);
			ctx.lineWidth = "3";
			ctx.strokeStyle = "grey";
			ctx.lineTo(this.points[i].x,this.points[i].y);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	};
}

function detectColision(x, y){
	
	for(var i = 0; i < bodies.length; i++){
		b = bodies[i];
		var dist = Math.sqrt(
			(x - b.x) * (x - b.x) + 
			(y - b.y) * (y - b.y)
		);


		if((b.radius + 2) > dist)
			return true;
	}
	return false;	
}

function drawPredictedPath(ev){

       var predictedPath = ev.data;
			ctx.beginPath();
			ctx.moveTo(mouse.lastClickX, mouse.lastClickY);
       for(var i = 0; i < predictedPath.length - 1; i++){
			ctx.beginPath();
			ctx.moveTo(predictedPath[i].x, predictedPath[i].y);
			ctx.lineWidth = "5";
			ctx.strokeStyle = "grey";				
			ctx.lineTo(predictedPath[i + 1].x, predictedPath[i + 1].y);
			ctx.stroke();
			if(detectColision(predictedPath[i + 1].x, predictedPath[i + 1].y))
				break;
       }
       ctx.closePath();
}
