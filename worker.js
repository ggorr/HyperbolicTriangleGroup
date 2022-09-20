"use strict";

//importScripts('complex.js', 'triangle.js', 'group.js');
import TriangleGroup from './group.js'
import Triangle from './triangle.js'

/////////////////////////////////////////////////////////////////////
// 단계별로 그리려면 다음 코드를 적용한다. htg.js도 변경해야 한다.
onmessage = function (event) {
	var tg = new TriangleGroup(event.data.p, event.data.q, event.data.r);
	tg.iter = event.data.iter;
	tg.list.push([]);
	tg.list[0].push(Triangle.byAngles(tg.p, tg.q, tg.r));
	postMessage(tg.list[0])
	tg.triangleCount++;
	for (var i = 1; i < tg.iter; i++) {
		tg.buildStep();
		postMessage(tg.list[i]);
	}
}
/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
// 마지막 한 번만 그리려면 다음 코드를 적용한다. htg.js도 변경해야 한다.
// onmessage = function(event) {
// 	var tg = new TriangleGroup(event.data.p, event.data.q, event.data.r);
// 	tg.iter = event.data.iter;
// 	tg.build();
// 	postMessage(tg.list);
// }
/////////////////////////////////////////////////////////////////////
