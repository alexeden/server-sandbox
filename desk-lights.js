const R = require('ramda');
const five = require('johnny-five');
const nodePixel = require('node-pixel');
const MemPixels = require('./mem-pixel.js');
const PixBuff = require('./pixel-buffers.js');
const {trace, inspect, log} = require('./debug-helpers.js');
const settings = require('./config-loader.js');
const createStripSettings = board => Object.assign({}, settings.STRIP, {board});


/**
*   Event handlers
*/
const onBoardMessage = R.curry((strip, e) => e.message === 'Closing.' ? log.y('Board is closing') || strip.off() : ()=>{});
const loopIteration = (strip, mems) => {
    'use strict';
    let forwardBuffer = PixBuff.createBuffer();
    let reverseBuffer = PixBuff.createBuffer();
    /*forwardBuffer[0] = forwardBuffer[12] = */reverseBuffer[15] = settings.COLORS.blue;
    // forwardBuffer[7] = forwardBuffer[9] = reverseBuffer[1] = reverseBuffer[20] = settings.COLORS.gold;
    return () => {
        PixBuff.mergeBuffers(forwardBuffer = PixBuff.shiftRight(forwardBuffer), reverseBuffer = PixBuff.shiftLeft(reverseBuffer)).map((c, i) => {
            mems[i].next(c);
        });
        strip.show();
    }
};
const onBoardReady = () => {
    const strip = new nodePixel.Strip(createStripSettings(board));
    board.on('message', onBoardMessage(strip));
    strip.on('ready', () => board.loop(1000/settings.FPS, loopIteration(strip, MemPixels(strip))));
}

/**
*   Board instantiation
*/
const board = new five.Board(settings.BOARD).on('ready', onBoardReady);
