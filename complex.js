"use strict";

const epsilon = 1e-9;

function isZero(d) {
	return -epsilon < d && d < epsilon;
}

class Complex {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static copy(z) {
		return new Complex(z.x, z.y);
	}

	toString() {
		return this.x + (this.y >= 0 ? "+" : "") + this.y + "i";
	}

	squareLength() {
		return this.x * this.x + this.y * this.y;
	}

	conjugate() {
		this.y = -this.y;
		return this;
	}

	add(z) {
		this.x += z.x;
		this.y += z.y;
		return this;
	}

	sub(z) {
		this.x -= z.x;
		this.y -= z.y;
		return this;
	}

	mul(z) {
		const t = this.x;
		this.x = t * z.x - this.y * z.y;
		this.y = t * z.y + this.y * z.x;
		return this;
	}

	reciprocal(d) {
		const factor = d / this.squareLength();
		this.x *= factor;
		this.y *= -factor;
		return this;
	}

	equals(z) {
		return isZero(this.x - z.x) && isZero(this.y - z.y);
	}

	static dist(z, w) {
		return Math.sqrt((z.x - w.x) * (z.x - w.x) + (z.y - w.y) * (z.y - w.y));

	}

	static conjugate(z) {
		return new Complex(z.x, -z.y);
	}

	static sub(z, w) {
		return new Complex(z.x - w.x, z.y - w.y);
	}

	static mulImag(d, z) {
		return new Complex(-z.y * d, z.x * d);
	}

	static isLinear(z, w) {
		return isZero(z.x * w.y - z.y * w.x);
	}
}

export { isZero, Complex };