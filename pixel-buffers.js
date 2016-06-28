const R = require('ramda');
const util = require('util');
const assert = require('assert');
const {tap, log} = require('./debug-helpers.js');
const {EMPTY_CHANNEL_VALUE, PIXEL_CHANNELS, BUFFER_SIZE} = require('./config-loader.js');

const EMPTY_SLOT = () => R.repeat(EMPTY_CHANNEL_VALUE, PIXEL_CHANNELS);
const createBuffer = () => R.repeat(EMPTY_SLOT(), BUFFER_SIZE)

const mergePixels = R.compose(R.map(R.sum), R.zip);
const mergeBuffers = R.compose(R.map(([pix1,pix2]) => mergePixels(pix1, pix2)), R.zip)
const shiftLeft = buff => [...R.tail(buff), R.head(buff)];
const shiftRight = buff => [R.last(buff), ...R.init(buff)];


module.exports = {
    createBuffer,
    mergeBuffers,
    shiftLeft,
    shiftRight
}
