"use strict";
import { Complex } from './complex.js';
import Triangle from './triangle.js';

class TriangleGroup {
	constructor(p, q, r) {
		this.p = p;
		this.q = q;
		this.r = r;
		this.iter = 0;
		this.list = [];
		this.fill = false;
		this.triangleCount = 0;
		this.rotation = new Complex(Math.cos(2 * Math.PI / p), Math.sin(2 * Math.PI / p));
	}

	showTriangle(context) {
		const tr = Triangle.byAngles(this.p, this.q, this.r);
		this.list.push([]);
		this.list[0].push(tr);
		this.triangleCount = 1;
		tr.draw(context);
	}

	build() {
		this.list.push([]);
		this.list[0].push(Triangle.byAngles(this.p, this.q, this.r));
		this.triangleCount++;
		for (var i = 1; i < this.iter; i++)
			this.buildStep();
	}

	buildStep() {
		const src = this.list[this.list.length - 1];
		const dst = [];
		this.list.push(dst);
		for (var i = 0; i < src.length; i++) {
			const next1 = src[i].getInverseForIteration("AB");
			if (next1 != null && !this.listContains(next1))
				dst.push(next1);
			const next2 = src[i].getInverseForIteration("BC");
			if (next2 != null && !this.listContains(next2))
				dst.push(next2);
			const next3 = src[i].getInverseForIteration("CA");
			if (next3 != null && !this.listContains(next3))
				dst.push(next3);
		}
		this.triangleCount += dst.length;
	}

	listContains(tr) {
		for (var i = 0; i < this.list.length; i++) {
			const sublist = this.list[i];
			for (var j = 0; j < sublist.length; j++)
				if (sublist[j].equals(tr))
					return true;
		}
		return false;
	}

	/* 아름다운 코드지만 느리다
	listContains(tr) {
		for (let sublist of this.list)
			for (let t of sublist)
				if (t.equals(tr))
					return true;
		return false;
	}
	*/
	displayAll(context) {
		for (var i = 0; i < this.list.length; i++)
			this.display(context, i);
	}

	display(context, n) {
		const sublist = this.list[n];
		if (this.fill) {
			if ((n & 1) == 0)
				for (var j = 0; j < sublist.length; j++)
					this.transformAndFill(context, Triangle.copy(sublist[j]));
			else
				for (var j = 0; j < sublist.length; j++)
					this.transformAndFill(context, Triangle.conjugate(sublist[j]));
		} else {
			for (var j = 0; j < sublist.length; j++)
				this.transformAndDraw(context, Triangle.copy(sublist[j]));
		}
	}

	transformAndFill(context, tr) {
		tr.fill(context);
		for (var i = 1; i < this.p; i++) {
			tr.mul(this.rotation);
			tr.fill(context);
		}
	}

	transformAndDraw(context, tr) {
		const conj = Triangle.conjugate(tr)
		tr.draw(context);
		conj.draw(context);
		for (var i = 1; i < this.p; i++) {
			tr.mul(this.rotation);
			tr.draw(context);
			conj.mul(this.rotation);
			conj.draw(context);
		}
	}

	draw_direct(context) {
		const startTime = Date.now();
		this.list.push([]);
		const tr = Triangle.byAngles(this.p, this.q, this.r);
		this.list[0].push(tr);
		if (this.fill)
			this.transformAndFill(context, tr);
		else
			this.transformAndDraw(context, tr);
		this.triangleCount++;
		for (var i = 1; i < this.iter; i++)
			this.drawStep_direct(context);
		document.getElementById("time").value = ((Date.now() - startTime) / 1000);
		document.getElementById("triangles").value = "2p x " + this.triangleCount.toString();
	}

	drawStep_direct(context) {
		const n = this.list.length;
		const src = this.list[n - 1];
		const dst = [];
		this.list.push(dst);
		for (var i = 0; i < src.length; i++) {
			var next = src[i].getInverseForIteration("AB");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill(context, (n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(context, Triangle.copy(next));
				dst.push(next);
			}
			next = src[i].getInverseForIteration("BC");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill(context, (n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(context, Triangle.copy(next));
				dst.push(next);
			}
			next = src[i].getInverseForIteration("CA");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill(context, (n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(context, Triangle.copy(next));
				dst.push(next);
			}
		}
		this.triangleCount += dst.length;
	}
}

export default TriangleGroup;
