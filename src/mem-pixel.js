const R = require('ramda');
const util = require('util');
const assert = require('assert');
const d3 = require('d3');
const {millis} = require('./mark.js');
const Pixicle = require('./pixicle.js');
const {tap, log} = require('./debug-helpers.js');

const PHI = (1+Math.sqrt(5))/2
const absDiff = (x, y) => Math.abs(Math.max(x, y) - Math.min(x, y));
const decay = R.curry((f, x0, x1) => x0 + f*(x1 - x0));
const interpolate = R.ifElse(R.lt, decay(0.99), decay(1/PHI));
const pixelColorToRgbArray = R.props(['r', 'g', 'b']);
const valToColor = d3.scale.linear().domain([0, 1]).range([0, 255]).clamp(true);
const colorToVal = d3.scale.linear().domain([0, 255]).range([0, 1]);
const rgbToUnits = R.map(colorToVal);
const unitsToRgb = R.map(valToColor);
const colorDiff = R.compose(R.map(colorToVal), R.map(([x, y]) => x - y), R.zip);

const MemPixel = {
  init(pixel) {
    this.pixel = pixel;
    this.pixicles = [Pixicle.create(), Pixicle.create(), Pixicle.create()];
    return this;
  },
  override(c1) {
    this.pixel.color(c1);
  },
  next(c1) {
    const t = millis();
    const next = this.pixicles.map((pix, i) => {
      return pix.tick(t, c1[i]).x0;
    });
    const c0 = pixelColorToRgbArray(this.pixel.color());

    const nextColor = next
      .map(x => Math.max(x, 0))
      .map(Math.round);
    this.pixel.color(nextColor);
  }
}

module.exports = function(controller) {
  return R.range(0, controller.stripLength()).map(i => {
    return Object.create(MemPixel).init(controller.pixel(i));
  });
}
