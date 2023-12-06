// Based heavily off: https://github.com/wesbos/hot-tips/tree/main/fun-windows

const svgns = "http://www.w3.org/2000/svg";
const svg = document.querySelector('svg');
const circleRadius = 50;
let isCircleController = true;

class Circle {
	constructor(x, y, radius) {
		this.el = document.createElementNS(svgns, 'circle');
		this.x = x;
		this.y = y;
		this.r = radius;
		svg.appendChild(this.el);
	}

	set(key, val) {
		this.el.setAttribute(key, val);
	}
	
	get(key) {
		return this.el.getAttribute(key);
	}

	getint(key) {
		return parseInt(this.get(key));
	}

	set x(x) {
		this.set('cx', x);
	}

	set y(y) {
		this.set('cy', y);
	}

	set r(r) {
		this.set('r', r);
	}

	set pos({x, y}) {
		this.x = x;
		this.y = y;
	}

	get x() {
		return this.getint('cx');
	}

	get y() {
		return this.getint('cy');
	}

	get r() {
		return this.getint('r');
	}

	get pos() {
		return {
			x: this.x,
			y: this.y,
		};
	}
}

function clearOldStorage() {
	const info = getCircleInfo()
	if(Date.now() - info.lastUpdated > 1000) {
		window.localStorage.removeItem('circleInfo');
	}
}

function getCircleInfo() {
	return JSON.parse(window.localStorage.getItem('circleInfo')) ?? {
		pos: {
			x: 50,
			y: 50,
		},
		vel: {
			x: 5,
			y: 5,
		},
		lastUpdated: Date.now()
	};
}

function getScreenInfo() {
	return {
		pos: {
			x: window.screenX,
			y: window.screenY,
		},
		size: {
			width: window.outerWidth,
			height: window.outerHeight,
		},
		screen: {
			width: window.screen.availWidth,
			height: window.screen.availHeight,
		}
	};
}

function moveCircle(circleInfo, screenInfo) {
	const r2 = circleRadius / 2;
	circleInfo.pos.x += circleInfo.vel.x;
	circleInfo.pos.y += circleInfo.vel.y;
	if(circleInfo.pos.x - r2 < 0) {
		circleInfo.vel.x *= -1;
		// circleInfo.pos.x = -(circleInfo.pos.x - r2) + r2;
	} else if(circleInfo.pos.x + r2 >= screenInfo.screen.width) {
		circleInfo.vel.x *= -1;
		// circleInfo.pos.x = screenInfo.screen.width - (circleInfo.pos.x + r2) - r2
	}
	if(circleInfo.pos.y - r2 < 0) {
		circleInfo.vel.y *= -1;
		// circleInfo.pos.y = -(circleInfo.pos.y - r2) + r2;
	} else if(circleInfo.pos.y + r2 >= screenInfo.screen.height) {
		circleInfo.vel.y *= -1;
		// circleInfo.pos.y = screenInfo.screen.height - (circleInfo.pos.y + r2) - r2
	}
	circleInfo.lastUpdated = Date.now();
}

function setCircleInfo(circleInfo) {
	window.localStorage.setItem('circleInfo', JSON.stringify(circleInfo));
}

function drawCircle(circle, circleInfo, screenInfo) {
	circle.pos = {
		x: circleInfo.pos.x - screenInfo.pos.x,
		y: circleInfo.pos.y - screenInfo.pos.y,
	};
}

function main(){
	const circle = new Circle(-100, -100, circleRadius);
	setInterval(() => {
		clearOldStorage();
		const circleInfo = getCircleInfo();
		const screenInfo = getScreenInfo();
		if(isCircleController) {
			moveCircle(circleInfo, screenInfo);
			setCircleInfo(circleInfo);
		}
		drawCircle(circle, circleInfo, screenInfo);
	}, 10);
}

main();
