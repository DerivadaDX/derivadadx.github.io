getSketches = () => {
	const sketches = [
		{
			fn: (p) => {
				sketches[0].p5 = p;

				let w, h;
				const borderRadius = 5;

				p.setup = () => {
					const carousel = $('#main_carousel').parent();
					h = carousel.height();
					w = carousel.width();

					p.createCanvas(w, h);
					p.background(55, 105, 75);
					p.rectMode(p.CENTER);
					p.smooth();

					// Must be at the end
					sketches[0].initialized = true;
				};

				p.draw = () => {
					p.translate(p.width / 2, p.height / 2);

					if (!p.mouseIsPressed) {
						let size = p.constrain(p.mouseY / 3, 10, p.mouseY / 3),
							r = p.random(256),
							g = p.random(256),
							b = p.random(256),
							alpha = p.random(256);

						// center square
						p.push();
						p.noStroke();
						p.fill(r, g, b, alpha);
						p.rotate(p.radians(p.frameCount));
						p.ellipse(0, 0, size, size);
						p.pop();

						// Other squares
						if (p.frameCount % 5 === 0) {
							p.fill(255 - r, 255 - g, 255 - b, alpha);
						}
						p.rect(-w / 2 + p.mouseX, -h / 2 + p.mouseY, size, size, borderRadius);
						p.rect(w / 2 - p.mouseX, h / 2 - p.mouseY, size, size, borderRadius);
					}
				};
			},
		},
		{
			fn: (p) => {
				sketches[1].p5 = p;

				let w, h,
					point = {},
					x = 0, y = 0,
					xd = 1, yd = 0,
					xOffset, yOffset;

				const divisions = 50;

				p.setup = () => {
					const carousel = $('#main_carousel').parent();
					h = carousel.height();
					w = carousel.width();

					p.createCanvas(w, h);
					p.background('black');
					changeStrokeColor();

					xOffset = w / divisions;
					yOffset = h / divisions;
					point = randomCoord();

					// Must be at the end
					sketches[1].initialized = true;
				};

				p.draw = () => {
					drawLine();
				};

				function changeStrokeColor() {
					p.stroke(p.random(255), p.random(255), p.random(255), p.random(128, 256));
				}

				function drawLine() {
					p.line(point.x, point.y, x, y);
					p.strokeWeight(p.random(1, 3));

					if (p.frameCount % (4 * divisions) === 0) {
						changeStrokeColor();
					}

					getNextPoint();
				}

				function randomCoord() {
					return {
						x: p.constrain(p.random(w), xOffset, w - xOffset),
						y: p.constrain(p.random(h), yOffset, h - yOffset),
					}
				}

				function getNextPoint() {
					const f = p.frameCount;

					if (f % divisions === 1) {
						if (xd === 1 && yd === 0 && f !== 1) {
							xd = 0; yd = 1;
						} else if (xd === 0 && yd === 1) {
							xd = -1; yd = 0;
						} else if (xd === -1 && yd === 0) {
							xd = 0; yd = -1;
						} else if (xd === 0 && yd === -1) {
							xd = 1; yd = 0;
						}
					}

					x += xd * xOffset;
					y += yd * yOffset;
				}
			}
		},
		{
			fn: (p) => {
				sketches[2].p5 = p;

				let mainCircle;

				p.setup = () => {
					const carousel = $('#main_carousel').parent();

					p.createCanvas(carousel.width(), carousel.height());

					p.background('black');
					p.noFill();

					mainCircle = new GrowingCircle({
						x: p.width / 2,
						y: p.height / 2,
						maxRadius: 100
					});

					// Must be at the end
					sketches[2].initialized = true;
				};

				p.draw = () => {
					p.background(50, 0, 50, 25);
					mainCircle.draw(4);
				};

				/**
				 * Simple representation of a circle from a center and a radius.
				 * Provides some useful methods for obtaining positions on its circumference.
				 */
				class Circle {
					//#region getters & setters
					get x() { return this._x; }
					get y() { return this._y; }
					get radius() { return this._radius; }
					get center() { return { x: this.x, y: this.y }; }

					set x(x) { this._x = x; }
					set y(y) { this._y = y; }
					set radius(r) { this._radius = r; }
					set center(c) { this._x = c.x; this._y = c.y; }

					getX() { return this.x; }
					getY() { return this.y; }
					getRadius() { return this.radius; }
					getCenter() { return this.center; }

					setX(x) { this.x = x; return this; }
					setY(y) { this.y = y; return this; }
					setRadius(r) { this.radius = r; return this; }
					setCenter(c) { this.center = c; return this; }
					//#endregion

					constructor(config) {
						this._x = config ? (config.x ?? 0) : 0;
						this._y = config ? (config.y ?? 0) : 0;
						this._radius = config ? (config.radius ?? 0) : 0;
					}

					/**
					 * Draws the circle.
					 */
					draw() {
						p.push();
						p.stroke('white');
						p.ellipse(this.x, this.y, 2 * this.radius);
						p.pop();
					}

					//#region trigonometry
					getPointByDegrees(degrees) {
						let rads = p.radians(degrees);

						return {
							x: this.getXByRadians(rads),
							y: this.getYByRadians(rads),
						};
					}

					getXByDegrees(degrees) {
						return this.getXByRadians(p.radians(degrees));
					}

					getYByDegrees(degrees) {
						return this.getYByRadians(p.radians(degrees));
					}

					getXByRadians(rads) {
						return this.x + this.radius * p.cos(rads);
					}

					getYByRadians(rads) {
						return this.y - this.radius * p.sin(rads);
					}
					//#endregion
				}

				/**
				 * A circle that randomly changes the value of its radius, whose maximum and minimum values can be configured.
				 * @extends Circle
				 */
				class GrowingCircle extends Circle {
					//#region getters & setters
					get minRadius() { return this._minRadius; }
					get maxRadius() { return this._maxRadius; }

					set minRadius(mr) { this._minRadius = mr; }
					set maxRadius(mr) { this._maxRadius = mr; }

					getMinRadius() { return this.minRadius; }
					getMaxRadius() { return this.maxRadius; }

					setMinRadius(mr) { this.minRadius = mr; return this; }
					setMaxRadius(mr) { this.maxRadius = mr; return this; }
					//#endregion

					constructor(config) {
						super(config);

						// radius
						this._minRadius = config.minRadius ?? 1;
						this._maxRadius = config.maxRadius ?? 101;
						this._radius = config.radius ?? this._maxRadius;

						// parent
						this._angleFromParent = 0;
						this._distanceFromParent = 0;

						// control
						this._frameCountOfFirstDraw = 0;
					}

					/**
					 * Draws the circle with a random radius value.
					 * @param {number} frameSkip Number of frames that must pass before drawing again.
					 */
					draw(frameSkip) {
						if (frameSkip && !this._frameCountOfFirstDraw) {
							this._frameCountOfFirstDraw = p.frameCount;
						}

						if (!frameSkip || (p.frameCount - this._frameCountOfFirstDraw) % frameSkip === 0) {
							p.push();
							p.stroke('white');
							p.ellipse(this.x, this.y, 2 * p.random(this.minRadius, this.maxRadius));
							p.pop();
						}
					}

					//#region parent
					setParent(p) {
						this._parent = p;
						return this;
					}

					setAngleFromParent(a) {
						this.angleFromParent = a;
						return this;
					}

					setDistanceFromParent(d) {
						this.distanceFromParent = d;
						return this;
					}
					//#endregion
				}

				/**
				 * Returns a random p5.Color whose maximum or minimum values ​​can be configured through its RGBA components.
				 */
				class ColorRandomizer {
					constructor(config) {
						// Asignación de valores a través de configuración o por defecto.
						this._min = config.min ?? 0;
						this._max = config.max ?? 256;
						this._alpha = config.alpha ?? 255;

						// Se limitan valores mínimos y máximos a 0 y 256 respectivamente.
						if (this._min < 0) this._min = 0;
						if (this._max > 256) this._max = 256;

						// Asignación de valores a través de configuración.
						// Los valores por defecto son _min y _max según corresponda.
						this._minRed = config.minRed ?? this._min;
						this._maxRed = config.maxRed ?? this._max;

						this._minGreen = config.minGreen ?? this._min;
						this._maxGreen = config.maxGreen ?? this._max;

						this._minBlue = config.minBlue ?? this._min;
						this._maxBlue = config.maxBlue ?? this._max;

						this._minAlpha = config.minAlpha;
						this._maxAlpha = config.maxAlpha;

						// Se limitan valores mínimos y máximos a 0 y 256 respectivamente.
						if (this._minRed < 0) this._minRed = 0;
						if (this._maxRed > 256) this._maxRed = 256;

						if (this._minGreen < 0) this._minGreen = 0;
						if (this._maxGreen > 256) this._maxGreen = 256;

						if (this._minBlue < 0) this._minBlue = 0;
						if (this._maxBlue > 256) this._maxBlue = 256;

						if (this._minAlpha < 0) this._minAlpha = 0;
						if (this._maxAlpha > 256) this._maxAlpha = 256;
					}

					getColor() {
						return p.color(
							p.random(this._minRed, this._maxRed),
							p.random(this._minGreen, this._maxGreen),
							p.random(this._minBlue, this._maxBlue),
							(this._minAlpha ?? -1) >= 0 || (this._maxAlpha ?? -1) >= 0
								? p.random(this._minAlpha ?? 0, this._maxAlpha ?? 256)
								: this._alpha
						);
					}
				}
			}
		}
	];

	sketches.forEach((sketch, index) => {
		sketch.parent = 'carousel_sketch_' + index;
		sketch.initialized = false;
		sketch.p5 = null;
	});

	return sketches;
};