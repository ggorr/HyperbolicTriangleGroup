"use strict";

import TriangleGroup from './group.js';

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
		document.getElementById("maxiter").value = "44";
	} else if (button == 2) {
		document.getElementById("p").value = "2";
		document.getElementById("q").value = "3";
		document.getElementById("r").value = "Infinity";
		document.getElementById("maxiter").value = "30";
	} else if (button == 3) {
		document.getElementById("p").value = "4";
		document.getElementById("q").value = "Infinity";
		document.getElementById("r").value = "Infinity";
		document.getElementById("maxiter").value = "16";
	} else {
		document.getElementById("p").value = "4";
		document.getElementById("q").value = "4";
		document.getElementById("r").value = "4";
		document.getElementById("maxiter").value = "15";
	}
}

let worker;
let interval;
let tg;
let svgAsShown;
let offset = 10;

function setUnit() {
	let unit = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) - 2 * offset;
	document.getElementById('unit').value = unit;
	return unit;
}

function transformCanvas() {
	let unit = parseFloat(document.getElementById('unit').value);
	if (!unit) {
		unit = setUnit();
	}
	let canvas = document.getElementById("canvas");
	canvas.height = canvas.width = 2 * (unit + offset);
	window.context = canvas.getContext('2d');
	let cenX = unit + offset;
	let cenY = unit + offset;
	window.context.setTransform(unit, 0, 0, -unit, cenX, cenY);
	window.context.lineWidth = 1 / unit;
}

function showTriangle() {
	if (typeof worker !== "undefined")
		return;
	svgAsShown = true;
	setSvgFile();
	setInfo('', 'normal');
	transformCanvas();
	window.context.strokeStyle = "#448";
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
	if (typeof worker !== "undefined")
		return;
	svgAsShown = false;
	setSvgFile();
	setInfo('', 'normal');
	let p = Number(document.getElementById("p").value);
	let q = Number(document.getElementById("q").value);
	let r = Number(document.getElementById("r").value);
	if (1 / p + 1 / q + 1 / r >= 1) {
		setInfo("1/p+1/q+1/r<1", 'error');
		return;
	}
	tg = new TriangleGroup(p, q, r);
	tg.iter = parseInt(document.getElementById("maxiter").value);
	tg.fill = document.getElementById("fill").checked;

	transformCanvas();
	window.context.strokeStyle = "#448";
	window.context.fillStyle = "#448";
	let timeCount = 0;
	interval = setInterval(function () {
		timeCount++;
		document.getElementById("time").value = (timeCount / 10).toFixed(1);
	}, 100);

	worker = new Worker("./worker.js", { type: 'module' });

	/////////////////////////////////////////////////////////////////////
	// 단계별로 그리려면 다음 코드를 적용한다. worker.js도 변경해야 한다.
	let iterCount = 0;
	worker.onmessage = function (event) {
		tg.list.push(event.data);
		tg.triangleCount += event.data.length;
		tg.drawStep(iterCount++);
		document.getElementById("time").value = (timeCount / 10).toFixed(1);
		document.getElementById("triangles").value = "2p x " + tg.triangleCount;
		document.getElementById("iteration").value = iterCount;
		if (iterCount >= tg.iter) {
			drawBigCircle();
			stopBuilding();
		}
	}
	/////////////////////////////////////////////////////////////////////

	/////////////////////////////////////////////////////////////////////
	// 마지막 한 번만 그리려면 다음 코드를 적용한다. worker.js도 변경해야 한다.
	// worker.onmessage = function (event) {
	// 	tg.list = event.data;
	// 	for (let i = 0; i < tg.list.length; i++)
	// 		tg.triangleCount += tg.list[i].length;
	// 	tg.drawAll();
	// 	document.getElementById("triangles").value = "2p x " + tg.triangleCount;
	// 	document.getElementById("time").value = (timeCount / 10).toFixed(1);
	// 	stopBuilding();
	// }
	/////////////////////////////////////////////////////////////////////

	worker.postMessage(tg);
}

function stopBuilding() {
	if (typeof worker === "undefined")
		return;
	clearInterval(interval);
	worker.terminate();
	worker = undefined;
}

function setSvgFile() {
	let p = document.getElementById("p").value.trim();
	if (p === 'Infinity') p = 'Inf';
	let q = document.getElementById("q").value.trim();
	if (q === 'Infinity') q = 'Inf';
	let r = document.getElementById("r").value.trim();
	if (r === 'Infinity') r = 'Inf';
	document.getElementById('svg-file').value = `${p}${q}${r}.svg`;
}

function saveSvg() {
	let svgUnit = parseInt(document.getElementById('svg-unit').value);
	let svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
	baseProfile="full" 
	transform="matrix(1 0 0 -1 10 10)"
	width="${2 * svgUnit}" height="${2 * svgUnit}" 
	viewBox="-1 -1 2 2"
	stroke="${tg.fill & !svgAsShown ? 'transparent' : '#448'}" 
	stroke-width="${1 / svgUnit}" 
	fill="${tg.fill & !svgAsShown ? '#448' : 'transparent'}">`
	let str ='';
	if (!svgAsShown) {
		for (let i = 1; i < tg.p; i++) {
			str += `<use href='#1overp' transform='rotate(${360 / tg.p * i})'/>`;
		}
		if (!tg.fill)
			for (let i = 0; i < tg.p; i++) {
				let angle = 2 * Math.PI * i / tg.p;
				let cos = Math.cos(angle);
				let sin = Math.sin(angle);
				str += `<use href='#1overp' transform='matrix(${cos} ${sin} ${sin} ${-cos} 0 0)'/>`;
			}
	}
	svg += `<g id='1overp'>
	${tg.getSvgAll(svgAsShown)}
	</g>${str}
	<circle cx="0" cy="0" r="1" stroke="#448" fill="transparent"/></svg>`;
	let blob = new Blob([svg], { type: 'image/svg+xml' });
	let link = document.createElement("a");
	link.download = document.getElementById('svg-file').value;
	link.href = window.URL.createObjectURL(blob);
	link.click();
}

function build_direct() {
	svgAsShown = false;
	setSvgFile();
	setInfo('', 'normal');
	transformCanvas();
	window.context.strokeStyle = "#448";
	window.context.fillStyle = "#448";
	tg = new TriangleGroup(
		Number(document.getElementById("p").value),
		Number(document.getElementById("q").value),
		Number(document.getElementById("r").value));
	tg.iter = parseInt(document.getElementById("maxiter").value);
	tg.fill = document.getElementById("fill").checked;
	tg.draw_direct();
	drawBigCircle();
}

function drawBigCircle() {
	window.context.beginPath();
	window.context.arc(0, 0, 1, 0, 2 * Math.PI);
	window.context.stroke();
}

export { loadSample, setUnit, showTriangle, build, build_direct, stopBuilding, saveSvg, setInfo };
