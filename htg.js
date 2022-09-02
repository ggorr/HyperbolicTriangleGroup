function setInfo(msg, type) {
	document.getElementById("info").innerHTML = 'info: ' + msg;
	if (type == 'error')
		document.getElementById("info").style.color = '#ff0000'
	else
		document.getElementById("info").style.color = '#000000'
}
function appendInfo(msg) {
	let prev = document.getElementById("info").innerHTML;
	document.getElementById("info").innerHTML = prev + msg;
}

function loadSample(button) {
	if (button == 1) {
		document.getElementById("p").value = "2";
		document.getElementById("q").value = "3";
		document.getElementById("r").value = "7";
		document.getElementById("maxiter").value = "46";
	} else if (button == 2) {
		document.getElementById("p").value = "2";
		document.getElementById("q").value = "3";
		document.getElementById("r").value = "Infinity";
		document.getElementById("maxiter").value = "30";
	} else if (button == 3) {
		document.getElementById("p").value = "2";
		document.getElementById("q").value = "Infinity";
		document.getElementById("r").value = "Infinity";
		document.getElementById("maxiter").value = "20";
	} else {
		document.getElementById("p").value = "4";
		document.getElementById("q").value = "4";
		document.getElementById("r").value = "4";
		document.getElementById("maxiter").value = "19";
	}
}

var context;
var worker;
var interval;

function transformCanvas() {
	let offset = 10;
	let radius = Math.min(window.innerWidth, window.innerHeight) / 2 - 2 * offset;
	let canvas = document.getElementById("canvas");
	canvas.height = canvas.width = 2 * (radius + offset);
	context = canvas.getContext('2d');

	let cenX = radius + offset;
	let cenY = radius + offset;
	context.setTransform(radius, 0, 0, -radius, cenX, cenY);
	context.lineWidth = 1 / radius;
}

function showTriangle() {
	if (typeof (worker) != "undefined")
		return;
	setInfo('', 'normal');
	transformCanvas();
	context.strokeStyle = "#000000";
	let p = Number(document.getElementById("p").value);
	let q = Number(document.getElementById("q").value);
	let r = Number(document.getElementById("r").value);
	if (1 / p + 1 / q + 1 / r >= 1) {
		setInfo("1/p+1/q+1/r<1", 'error');
		return;
	}
	tg = new TriangleGroup(p, q, r);
	tg.showTriangle();
	drawBigCircle();
	document.getElementById("triangles").value = "";
	document.getElementById("time").value = "";
}

function build() {
	if (typeof (worker) != "undefined")
		return;
	setInfo('', 'normal');
	let p = Number(document.getElementById("p").value);
	let q = Number(document.getElementById("q").value);
	let r = Number(document.getElementById("r").value);
	if (1 / p + 1 / q + 1 / r >= 1) {
		setInfo("1/p+1/q+1/r<1", 'error');
		return;
	}
	var tg = new TriangleGroup(p, q, r);
	tg.iter = Number(document.getElementById("maxiter").value);
	tg.fill = document.getElementById("fill").checked;

	transformCanvas();
	context.strokeStyle = "#000000";
	context.fillStyle = "#000000";
	var timeCount = 0;
	interval = setInterval(function () {
		timeCount++;
		document.getElementById("time").value = (timeCount / 10).toFixed(1);
	}, 100);
	drawBigCircle();

	worker = new Worker("worker.js");

	/////////////////////////////////////////////////////////////////////
	// 단계별로 그리려면 다음 코드를 적용한다. worker.js도 변경
	var iterCount = 0;
	worker.onmessage = function (event) {
		tg.list.push(event.data);
		tg.triangleCount += event.data.length;
		tg.display(iterCount++);
		document.getElementById("time").value = (timeCount / 10).toFixed(1);
		document.getElementById("triangles").value = "2p x " + tg.triangleCount;
		document.getElementById("iteration").value = iterCount;
		if (iterCount >= tg.iter) {
			stopBuilding();
		}
	}
	/////////////////////////////////////////////////////////////////////

	/////////////////////////////////////////////////////////////////////
	// 마지막 한 번만 그리려면 다음 코드를 적용한다. worker.js도 변경
	// worker.onmessage = function (event) {
	// 	tg.list = event.data;
	// 	for (var i = 0; i < tg.list.length; i++)
	// 		tg.triangleCount += tg.list[i].length;
	// 	tg.displayAll();
	// 	document.getElementById("triangles").value = "2p x " + tg.triangleCount;
	// 	document.getElementById("time").value = (timeCount / 10).toFixed(1);
	// 	stopBuilding();
	// }
	/////////////////////////////////////////////////////////////////////

	worker.postMessage(tg);
}

function stopBuilding() {
	if (typeof (worker) == 'undefined')
		return;
	clearInterval(interval);
	worker.terminate();
	worker = undefined;
}

function draw_atonce() {
	transformCanvas();
	context.strokeStyle = "#000000";
	context.fillStyle = "#000000";
	tg = new TriangleGroup(
		Number(document.getElementById("p").value),
		Number(document.getElementById("q").value),
		Number(document.getElementById("r").value));
	tg.iter = Number(document.getElementById("maxiter").value);
	tg.fill = document.getElementById("fill").checked;
	tg.draw_atonce();
	drawBigCircle();
}

function drawBigCircle() {
	context.beginPath();
	context.arc(0, 0, 1, 0, 2 * Math.PI);
	context.stroke();
}