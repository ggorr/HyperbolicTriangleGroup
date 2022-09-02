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

	showTriangle() {
		let tr = Triangle.byAngles(this.p, this.q, this.r);
		this.list.push([]);
		this.list[0].push(tr);
		this.triangleCount = 1;
		tr.draw();
	}

	build() {
		this.list.push([]);
		this.list[0].push(Triangle.byAngles(this.p, this.q, this.r));
		this.triangleCount++;
		for (var i = 1; i < this.iter; i++)
			this.buildStep();
	}

	buildStep() {
		let src = this.list[this.list.length - 1];
		let dst = [];
		this.list.push(dst);
		for (var i = 0; i < src.length; i++) {
			let next = src[i].getInverseForIteration("AB");
			if (next != null && !this.listContains(next))
				dst.push(next);
			next = src[i].getInverseForIteration("BC");
			if (next != null && !this.listContains(next))
				dst.push(next);
			next = src[i].getInverseForIteration("CA");
			if (next != null && !this.listContains(next))
				dst.push(next);
		}
		this.triangleCount += dst.length;
	}

	listContains(tr) {
		for (var i = 0; i < this.list.length; i++) {
			let sublist = this.list[i];
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
	displayAll() {
		for (var i = 0; i < this.list.length; i++)
			this.display(i);
	}

	display(n) {
		let sublist = this.list[n];
		if (this.fill) {
			if ((n & 1) == 0)
				for (var j = 0; j < sublist.length; j++)
					this.transformAndFill(Triangle.copy(sublist[j]));
			else
				for (var j = 0; j < sublist.length; j++)
					this.transformAndFill(Triangle.conjugate(sublist[j]));
		} else {
			for (var j = 0; j < sublist.length; j++)
				this.transformAndDraw(Triangle.copy(sublist[j]));
		}
	}

	transformAndFill(tr) {
		tr.fill();
		for (var i = 1; i < this.p; i++) {
			tr.mul(this.rotation);
			tr.fill();
		}
	}

	transformAndDraw(tr) {
		let conj = Triangle.conjugate(tr)
		tr.draw();
		conj.draw();
		for (var i = 1; i < this.p; i++) {
			tr.mul(this.rotation);
			tr.draw();
			conj.mul(this.rotation);
			conj.draw();
		}
	}

	draw_atonce() {
		let startTime = Date.now();
		this.list.push([]);
		let tr = Triangle.byAngles(this.p, this.q, this.r);
		this.list[0].push(tr);
		if (this.fill)
			this.transformAndFill(tr, 0);
		else
			this.transformAndDraw(tr);
		this.triangleCount++;
		for (var i = 1; i < this.iter; i++)
			this.drawStep_atonce();
		document.getElementById("time").value = ((Date.now() - startTime) / 1000);
		document.getElementById("triangles").value ="2p x " + this.triangleCount.toString();
	}

	drawStep_atonce() {
		let n = this.list.length;
		let src = this.list[n - 1];
		let dst = [];
		this.list.push(dst);
		for (var i = 0; i < src.length; i++) {
			var next = src[i].getInverseForIteration("AB");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill((n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(Triangle.copy(next));
				dst.push(next);
			}
			next = src[i].getInverseForIteration("BC");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill((n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(Triangle.copy(next));
				dst.push(next);
			}
			next = src[i].getInverseForIteration("CA");
			if (next != null && !this.listContains(next)) {
				if (this.fill)
					this.transformAndFill((n & 1) == 0 ? Triangle.copy(next) : Triangle.conjugate(next));
				else
					this.transformAndDraw(Triangle.copy(next));
				dst.push(next);
			}
		}
		this.triangleCount += dst.length;
	}
}