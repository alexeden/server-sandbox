const R = require('ramda');
const five = require('johnny-five');
const nodePixel = require('node-pixel');
const {trace, inspect, log} = require('./debug-helpers.js');
const settings = require('./config-loader.js');
const MemPixels = require('./mem-pixel.js');
const EMPTY_SLOT = () => R.repeat(settings.EMPTY_CHANNEL_VALUE, settings.PIXEL_CHANNELS);
const createBuffer = () => R.repeat(EMPTY_SLOT(), settings.BUFFER_SIZE)

const mergePixels = R.compose(R.map(R.sum), R.zip);
const mergeBuffers = R.compose(R.map(([pix1, pix2]) => mergePixels(pix1, pix2)), R.zip)
const shiftLeft = buff => [...R.tail(buff), R.head(buff)];
const shiftRight = buff => [R.last(buff), ...R.init(buff)];



const createStripSettings = board => Object.assign({}, settings.STRIP, {board});


/**
*   Event handlers
*/
const onBoardMessage = R.curry((strip, e) => e.message === 'Closing.' ? log.y('Board is closing') || strip.off() : ()=>{});
const loopIteration = (strip, mems) => {
  let forwardBuffer = createBuffer();
  let reverseBuffer = createBuffer();
  /*forwardBuffer[0] = forwardBuffer[12] = */
  reverseBuffer[15] = settings.COLORS.blue;
  // forwardBuffer[7] = forwardBuffer[9] = reverseBuffer[1] = reverseBuffer[20] = settings.COLORS.gold;
  return () => {
    mergeBuffers(forwardBuffer = shiftRight(forwardBuffer), reverseBuffer = shiftLeft(reverseBuffer)).map((c, i) => {
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
