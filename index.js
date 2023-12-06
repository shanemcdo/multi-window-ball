// Based heavily off: https://github.com/wesbos/hot-tips/tree/main/fun-windows

const svgns = "http://www.w3.org/2000/svg";
const svg = document.querySelector('svg');
const circleRadius = 50;
const idPrefix = 'circleInfo-';
const colors = [
	'rgb(255, 0, 0)',
	'rgb(255, 128, 0)',
	'rgb(255, 255, 0)',
	'rgb(128, 255, 0)',
	'rgb(0, 255, 0)',
	'rgb(0, 255, 128)',
	'rgb(0, 255, 255)',
	'rgb(0, 128, 255)',
	'rgb(0, 0, 255)',
	'rgb(128, 0, 255)',
	'rgb(255, 0, 255)',
	'rgb(255, 0, 128)'
];

class Circle {
	constructor(x, y, radius) {
		this.el = document.createElementNS(svgns, 'circle');
		this.x = x;
		this.y = y;
		this.r = radius;
		svg.appendChild(this.el);
	}

	remove() {
		svg.removeChild(this.el);
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

function getId() {
	const ids = Object.keys(window.localStorage)
		.filter(key => key.startsWith(idPrefix))
		.map(key => parseInt(key.replace(idPrefix, '')))
		.toSorted();
	return ids.at(-1) + 1 || 0
}

function getCircleInfos() {
	return Object.entries(window.localStorage)
		.filter(([key]) => key.startsWith(idPrefix))
		.map(([key, value]) => [key, JSON.parse(value)]);
}

function getCircleInfosArray() {
	const result = [];
	getCircleInfos()
		.map(([key, value]) => [parseInt(key.replace(idPrefix, '')), value])
		.forEach(([i, value]) => {
			result[i] = value
		});
	return result;
}

function removeCircleInfo(id) {
	window.localStorage.removeItem(`${idPrefix}${id}`);
}

function clearOldStorage() {
	getCircleInfos().forEach(([key, value]) => {
		if(Date.now() - value.lastUpdated > 1000) {
			window.localStorage.removeItem(key);
		}
	});
}

function getDefaultCircleInfo() {
	return {
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

function setCircleInfo(id, circleInfo) {
	window.localStorage.setItem(`${idPrefix}${id}`, JSON.stringify(circleInfo));
}

function drawCircle(circle, circleInfo, screenInfo) {
	circle.pos = {
		x: circleInfo.pos.x - screenInfo.pos.x,
		y: circleInfo.pos.y - screenInfo.pos.y,
	};
}

function max(a, b) {
	return a > b ? a : b;
}

function main(){
	const circles = [];
	clearOldStorage();
	const id = getId();
	console.log(id);
	window.onbeforeunload = () => {
		removeCircleInfo(id);
	};
	setInterval(() => {
		clearOldStorage();
		const screenInfo = getScreenInfo();
		const circleInfos = getCircleInfosArray();
		if(circleInfos[id] === undefined) {
			circleInfos[id] = getDefaultCircleInfo();
		}
		moveCircle(circleInfos[id], screenInfo);
		setCircleInfo(id, circleInfos[id]);
		const len = max(circleInfos.length, circles.length);
		for(let i = 0; i < len; i++) {
			if(circleInfos[i] === undefined) {
				console.log(circleInfos);
				console.log(circles);
				if(circles[i] !== undefined) {
					circles[i].remove();
					circles[i] = undefined;
				}
				continue;
			}
			if(circles[i] === undefined) {
				circles[i] = new Circle(-100, -100, circleRadius);
				circles[i].set('fill', colors[i % colors.length]);
			}
			drawCircle(circles[i], circleInfos[i], screenInfo);
		}
	}, 10);
}

main();
