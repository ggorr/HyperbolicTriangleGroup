"use strict";

import { isZero, Complex } from './complex.js';

function trunc(x) {
	// return Math.round(x * 100000) / 100000;
	let str = (Math.round(x * 100000) / 100000).toString();
	return x > 0 ? (str.length > 2 && x < 1 ? str.slice(1) : str) : x < 0 ? (str.length > 3 && x > -1 ? '-' + str.slice(2) : str) : str;
}

class Triangle {
	constructor(A, B, C, axis) {
		this.A = A;
		this.B = B;
		this.C = C;
		this.axis = axis;
	}

	static byAngles(p, q, r) {
		let cosp = Math.cos(Math.PI / p);
		let sinp = Math.sin(Math.PI / p);
		let cosq = Math.cos(Math.PI / q);
		let sinq = Math.sin(Math.PI / q);
		let cosr = Math.cos(Math.PI / r);
		let sinr = Math.sin(Math.PI / r);

		let coshB = (cosr + cosp * cosq) / (sinp * sinq);
		// let lenB = 1 - 2 / (coshB + Math.sqrt(coshB * coshB - 1) + 1); // OK
		// let lenB = Math.sqrt((coshB - 1) / (coshB + 1)); // WRONG if q = Infinity
		let lenB = Math.sqrt(1 - 2 / (coshB + 1));

		let coshC = (cosq + cosp * cosr) / (sinp * sinr);
		// let lenC = 1 - 2 / (coshC + Math.sqrt(coshC * coshC - 1) + 1); // OK
		// let lenC = Math.sqrt((coshC - 1) / (coshC + 1)); // WRONG if r = Infinity
		let lenC = Math.sqrt(1 - 2 / (coshC + 1));
		return new Triangle(new Complex(0, 0), new Complex(lenB, 0), new Complex(lenC * cosp, lenC * sinp), "");
	}

	/*
	static byAngles_old(p, q, r) {
		let B, C;
		let cosp = Math.cos(Math.PI / p);
		let sinp = Math.sin(Math.PI / p);
		if (r == Infinity) { // r = infinity
			C = new Complex(cosp, sinp);
			if (q == Infinity)
				B = new Complex(1, 0);
			else {
				let cosh = (1 + cosp * Math.cos(Math.PI / q)) / (sinp * Math.sin(Math.PI / q));
				let len = 1 - 2 / (cosh + Math.sqrt(cosh * cosh - 1) + 1);
				B = new Complex(len, 0);
			}
		} else {
			let cosq = Math.cos(Math.PI / q);
			let sinq = Math.sin(Math.PI / q);

			let cosh = (Math.cos(Math.PI / r) + cosp * cosq) / (sinp * sinq);
			let len = 1 - 2 / (cosh + Math.sqrt(cosh * cosh - 1) + 1);
			B = new Complex(len, 0);
			cosh = (cosq + cosp * Math.cos(Math.PI / r)) / (sinp * Math.sin(Math.PI / r));
			len = 1 - 2 / (cosh + Math.sqrt(cosh * cosh - 1) + 1);
			C = new Complex(len * cosp, len * sinp);
		}
		return new Triangle(new Complex(0, 0), B, C, "")
	}
	*/

	static copy(src) {
		return new Triangle(Complex.copy(src.A), Complex.copy(src.B), Complex.copy(src.C), src.axis);
	}

	static conjugate(src) {
		return new Triangle(Complex.conjugate(src.A), Complex.conjugate(src.B), Complex.conjugate(src.C), src.axis);
	}

	equals(t) {
		return this.A.equals(t.A) && this.B.equals(t.B) && this.C.equals(t.C);
	}

	mul(z) {
		this.A.mul(z);
		this.B.mul(z);
		this.C.mul(z);
	}

	getInverseForIteration(axis) {
		if (this.axis == axis)
			return null;
		if (axis == "AB") {
			if (Complex.isLinear(this.A, this.B))
				return null;
			else
				return new Triangle(this.A, this.B, Triangle.circleInversion(this.A, this.B, this.C), axis);
		} else if (axis == "BC") {
			if (Complex.isLinear(this.B, this.C))
				return null;
			else
				return new Triangle(Triangle.circleInversion(this.B, this.C, this.A), this.B, this.C, axis);
		} else {// if(axis == "CA")
			if (Complex.isLinear(this.C, this.A))
				return null;
			else
				return new Triangle(this.A, Triangle.circleInversion(this.C, this.A, this.B), this.C, axis);
		}
	}

	stroke() {
		window.context.beginPath();
		if (this.axis == "AB") {
			window.context.moveTo(this.B.x, this.B.y);
			Triangle.strokeSegment(this.B, this.C);
			Triangle.strokeSegment(this.C, this.A);
		} else if (this.axis == "BC") {
			window.context.moveTo(this.C.x, this.C.y);
			Triangle.strokeSegment(this.C, this.A);
			Triangle.strokeSegment(this.A, this.B);
		} else if (this.axis == "CA") {
			window.context.moveTo(this.A.x, this.A.y);
			Triangle.strokeSegment(this.A, this.B);
			Triangle.strokeSegment(this.B, this.C);
		} else {
			window.context.moveTo(this.A.x, this.A.y);
			Triangle.strokeSegment(this.A, this.B);
			Triangle.strokeSegment(this.B, this.C);
			Triangle.strokeSegment(this.C, this.A);
		}
		window.context.stroke();
	}

	fill() {
		window.context.beginPath();
		window.context.moveTo(this.A.x, this.A.y);
		Triangle.strokeSegment(this.A, this.B);
		Triangle.strokeSegment(this.B, this.C);
		Triangle.strokeSegment(this.C, this.A);
		// window.context.fillStyle = "#000000";
		window.context.fill();
	}

	strokeSvg() {
		let path;
		if (this.axis == "AB") {
			path = `<path d='M${trunc(this.B.x)} ${trunc(this.B.y)}`
			path += Triangle.strokeSegmentSvg(this.B, this.C);
			path += Triangle.strokeSegmentSvg(this.C, this.A);
		} else if (this.axis == "BC") {
			path = `<path d='M${trunc(this.C.x)} ${trunc(this.C.y)}`
			path += Triangle.strokeSegmentSvg(this.C, this.A);
			path += Triangle.strokeSegmentSvg(this.A, this.B);
		} else if (this.axis == "CA") {
			path = `<path d='M${trunc(this.A.x)} ${trunc(this.A.y)}`
			path += Triangle.strokeSegmentSvg(this.A, this.B);
			path += Triangle.strokeSegmentSvg(this.B, this.C);
		} else {
			path = `<path d='M${trunc(this.A.x)} ${trunc(this.A.y)}`
			path += Triangle.strokeSegmentSvg(this.A, this.B);
			path += Triangle.strokeSegmentSvg(this.B, this.C);
			path += Triangle.strokeSegmentSvg(this.C, this.A);
		}
		return path + `'/>`;
	}

	fillSvg() {
		let path = `<path d='M${trunc(this.A.x)} ${trunc(this.A.y)}`
		path += Triangle.strokeSegmentSvg(this.A, this.B);
		path += Triangle.strokeSegmentSvg(this.B, this.C);
		path += Triangle.strokeSegmentSvg(this.C, this.A);
		return path + `'/>`;
	}
	
	static circleInversion(a, b, z) {
		let d = 2 * (a.x * b.y - a.y * b.x);
		let lenA = (1 + a.squareLength()) / d;
		let lenB = (1 + b.squareLength()) / d;
		let c = Complex.mulImag(lenB, a).sub(Complex.mulImag(lenA, b));
		return Complex.sub(z, c).conjugate().reciprocal(c.squareLength() - 1).add(c);
	}

	static strokeSegment(z, w) {
		let d = z.x * w.y - z.y * w.x;
		if (isZero(d))
			window.context.lineTo(w.x, w.y);
		else {
			d *= 2;
			let lenZ = (1 + z.squareLength()) / d;
			let lenW = (1 + w.squareLength()) / d;
			let c = Complex.mulImag(lenW, z).sub(Complex.mulImag(lenZ, w));
			let angZ = Math.atan2(z.y - c.y, z.x - c.x);
			let angW = Math.atan2(w.y - c.y, w.x - c.x);
			if (angZ > angW + Math.PI)
				angW += 2 * Math.PI;
			else if (angW > angZ + Math.PI)
				angZ += 2 * Math.PI;
			window.context.arc(c.x, c.y, Complex.dist(z, c), angZ, angW, angZ > angW);
		}
	}
	static strokeSegmentSvg(z, w) {
		let d = z.x * w.y - z.y * w.x;
		if (isZero(d))
			return `L${trunc(w.x)} ${trunc(w.y)}`;
		else {
			d *= 2;
			let lenZ = (1 + z.squareLength()) / d;
			let lenW = (1 + w.squareLength()) / d;
			let c = Complex.mulImag(lenW, z).sub(Complex.mulImag(lenZ, w));
			let angZ = Math.atan2(z.y - c.y, z.x - c.x);
			let angW = Math.atan2(w.y - c.y, w.x - c.x);
			if (angZ > angW + Math.PI)
				angW += 2 * Math.PI;
			else if (angW > angZ + Math.PI)
				angZ += 2 * Math.PI;
			// window.context.arc(c.x, c.y, Complex.dist(z, c), angZ, angW, angZ > angW);
			let r = trunc(Complex.dist(z, c));
			return `A${r} ${r} 0 0 ${angZ > angW ? 0 : 1} ${trunc(w.x)} ${trunc(w.y)}`
		}
	}
}

export default Triangle;
