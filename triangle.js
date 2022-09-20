"use strict";

import { isZero, Complex } from './complex.js';

class Triangle {
	constructor(A, B, C, axis) {
		this.A = A;
		this.B = B;
		this.C = C;
		this.axis = axis;
	}

	static byAngles(p, q, r) {
		const cosp = Math.cos(Math.PI / p);
		const sinp = Math.sin(Math.PI / p);
		const cosq = Math.cos(Math.PI / q);
		const sinq = Math.sin(Math.PI / q);
		const cosr = Math.cos(Math.PI / r);
		const sinr = Math.sin(Math.PI / r);

		const coshB = (cosr + cosp * cosq) / (sinp * sinq);
		// const lenB = 1 - 2 / (coshB + Math.sqrt(coshB * coshB - 1) + 1); // OK
		// const lenB = Math.sqrt((coshB - 1) / (coshB + 1)); // WRONG if q = Infinity
		const lenB = Math.sqrt(1 - 2 / (coshB + 1));

		const coshC = (cosq + cosp * cosr) / (sinp * sinr);
		// const lenC = 1 - 2 / (coshC + Math.sqrt(coshC * coshC - 1) + 1); // OK
		// const lenC = Math.sqrt((coshC - 1) / (coshC + 1)); // WRONG if r = Infinity
		const lenC = Math.sqrt(1 - 2 / (coshC + 1));
		return new Triangle(new Complex(0, 0), new Complex(lenB, 0), new Complex(lenC * cosp, lenC * sinp), "");
	}

	/*
	static byAngles_old(p, q, r) {
		let B, C;
		const cosp = Math.cos(Math.PI / p);
		const sinp = Math.sin(Math.PI / p);
		if (r == Infinity) { // r = infinity
			C = new Complex(cosp, sinp);
			if (q == Infinity)
				B = new Complex(1, 0);
			else {
				const cosh = (1 + cosp * Math.cos(Math.PI / q)) / (sinp * Math.sin(Math.PI / q));
				const len = 1 - 2 / (cosh + Math.sqrt(cosh * cosh - 1) + 1);
				B = new Complex(len, 0);
			}
		} else {
			const cosq = Math.cos(Math.PI / q);
			const sinq = Math.sin(Math.PI / q);

			const cosh = (Math.cos(Math.PI / r) + cosp * cosq) / (sinp * sinq);
			const len = 1 - 2 / (cosh + Math.sqrt(cosh * cosh - 1) + 1);
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

	draw(context) {
		context.beginPath();
		if (this.axis == "AB") {
			context.moveTo(this.B.x, this.B.y);
			Triangle.drawSegment(context, this.B, this.C);
			Triangle.drawSegment(context, this.C, this.A);
		} else if (this.axis == "BC") {
			context.moveTo(this.C.x, this.C.y);
			Triangle.drawSegment(context, this.C, this.A);
			Triangle.drawSegment(context, this.A, this.B);
		} else if (this.axis == "CA") {
			context.moveTo(this.A.x, this.A.y);
			Triangle.drawSegment(context, this.A, this.B);
			Triangle.drawSegment(context, this.B, this.C);
		} else {
			context.moveTo(this.A.x, this.A.y);
			Triangle.drawSegment(context, this.A, this.B);
			Triangle.drawSegment(context, this.B, this.C);
			Triangle.drawSegment(context, this.C, this.A);
		}
		context.stroke();
	}

	fill(context) {
		context.beginPath();
		context.moveTo(this.A.x, this.A.y);
		Triangle.drawSegment(context, this.A, this.B);
		Triangle.drawSegment(context, this.B, this.C);
		Triangle.drawSegment(context, this.C, this.A);
		// context.fillStyle = "#000000";
		context.fill();
	}

	equals(t) {
		return this.A.equals(t.A) && this.B.equals(t.B) && this.C.equals(t.C);
	}

	static circleInversion(a, b, z) {
		const d = 2 * (a.x * b.y - a.y * b.x);
		const lenA = (1 + a.squareLength()) / d;
		const lenB = (1 + b.squareLength()) / d;
		const c = Complex.mulImag(lenB, a).sub(Complex.mulImag(lenA, b));
		return Complex.sub(z, c).conjugate().reciprocal(c.squareLength() - 1).add(c);
	}

	static drawSegment(context, z, w) {
		let d = z.x * w.y - z.y * w.x;
		if (isZero(d))
			context.lineTo(w.x, w.y);
		else {
			d *= 2;
			const lenZ = (1 + z.squareLength()) / d;
			const lenW = (1 + w.squareLength()) / d;
			const c = Complex.mulImag(lenW, z).sub(Complex.mulImag(lenZ, w));
			let angZ = Math.atan2(z.y - c.y, z.x - c.x);
			let angW = Math.atan2(w.y - c.y, w.x - c.x);
			if (angZ > angW + Math.PI)
				angW += 2 * Math.PI;
			else if (angW > angZ + Math.PI)
				angZ += 2 * Math.PI;
			context.arc(c.x, c.y, Complex.dist(z, c), angZ, angW, angZ > angW);
		}
	}
}

export default Triangle;
