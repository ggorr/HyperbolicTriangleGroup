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

let worker;
let interval;
let tg;
let justIt;

function transformCanvas() {
	let offset = 10;
	let radius = Math.min(window.innerWidth, window.innerHeight) / 2 - 2 * offset;
	let canvas = document.getElementById("canvas");
	canvas.height = canvas.width = 2 * (radius + offset);
	window.context = canvas.getContext('2d');
	let cenX = radius + offset;
	let cenY = radius + offset;
	window.context.setTransform(radius, 0, 0, -radius, cenX, cenY);
	window.context.lineWidth = 1 / radius;
}

function showTriangle() {
	if (typeof worker !== "undefined")
		return;
	justIt = true;
	let el = document.getElementById('download');
	while (el.firstChild)
		el.removeChild(el.firstChild);
	setInfo('', 'normal');
	transformCanvas();
	window.context.strokeStyle = "#000000";
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
	justIt = false;
	let el = document.getElementById('download');
	while (el.firstChild)
		el.removeChild(el.firstChild);
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
	window.context.strokeStyle = "#000000";
	window.context.fillStyle = "#000000";
	let timeCount = 0;
	interval = setInterval(function () {
		timeCount++;
		document.getElementById("time").value = (timeCount / 10).toFixed(1);
	}, 100);
	drawBigCircle();

	worker = new Worker("worker.js", { type: 'module' });

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

function saveSvg() {
	let unit = parseInt(document.getElementById('svg-unit').value);
	let p = document.getElementById("p").value.trim();
	let q = document.getElementById("q").value.trim();
	let r = document.getElementById("r").value.trim();
	let filename = `${p}${q}${r}.svg`;
	let svg = `<svg version="1.1" baseProfile="full" width="${unit}" height="${unit}" viewBox="-1 -1 2 2"
 		xmlns="http://www.w3.org/2000/svg" stroke="rgb(26,26,26)" stroke-width="${1 / unit}" 
		fill="${tg.fill & !justIt ? "rgb(192,192,192)" : "transparent"}">` +
		tg.getSvgAll(justIt) + '<circle cx="0" cy="0" r="1" fill="transparent"/></svg>';
	// stroke="${tg.fill & !justIt ? "rgb(26,26,26)" : "black"}"
	let blob = new Blob([svg], { type: 'image/svg+xml' });
	let link = document.createElement("a");
	link.download = filename;
	link.innerHTML = "Download " + filename;
	link.href = window.URL.createObjectURL(blob);
	let el = document.getElementById('download');
	while (el.firstChild)
		el.removeChild(el.firstChild);
	el.appendChild(link);
}

function build_direct() {
	transformCanvas();
	window.context.strokeStyle = "#000000";
	window.context.fillStyle = "#000000";
	let tg = new TriangleGroup(
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

export { loadSample, showTriangle, build, build_direct, stopBuilding, saveSvg, setInfo };
