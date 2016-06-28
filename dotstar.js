const R = require('ramda');
const {__, compose, times, divide, always, map, multiply, range, zip, repeat} = R;
const {tap, log, trace, inspect} = require('./debug-helpers.js');
const SPI = require('pi-spi');
const {
    SPI_PORT,
    COLORS,
    FPS,
    // N: number of LEDs in the strip
    // FRAME_SIZE: frame size in bytes of each LED frame and the start and end frames
    // LED_FRAME_OFFSET: the offset in bytes of each LED frame
    DOTSTAR: { N, FRAME_SIZE, LED_FRAME_OFFSET, START_FRAME_BYTE, LED_CONTROL_BYTE, END_FRAME_BYTE, CHANNELS, CHANNEL_MIN, CHANNEL_MAX }
} = require('./config-loader.js');

const Osci = require('./oscillator.js');
const clamp = compose(R.min(CHANNEL_MAX), R.max(CHANNEL_MIN), parseInt);
const OsciRandomInits = () => ({ z: 255*Math.random(), v: (10000*Math.random())-5000 });
const {TimeKeeper} = require('./mark.js');

// The master time keeper
const timeKeeper = TimeKeeper(always(FPS));

// Number of bytes needed for a complete update signal
const startFrameSize = R.always(FRAME_SIZE);
const endFrameSize = R.always(Math.ceil(N/2));
const bufferSize = R.always(FRAME_SIZE * N + endFrameSize() + startFrameSize());

// Create an array of offsets values in bytes of each led frame in the buffer
const ledFrameOffsets = compose(map(R.add(__, startFrameSize())), map(multiply(FRAME_SIZE)), range(0));

// The raw binary buffer and terminal frames
const binaryBuffer = new ArrayBuffer(bufferSize());
const startFrame = new Uint8ClampedArray(binaryBuffer, 0, startFrameSize()).fill(START_FRAME_BYTE);
const endFrame = new Uint8ClampedArray(binaryBuffer, startFrameSize() + N*FRAME_SIZE, endFrameSize()).fill(END_FRAME_BYTE);
var buffer = new Buffer(binaryBuffer);


// Create the oscillators (but do not start them), one for each led
const oscis = range(0, N).map(n => Osci(n, timeKeeper));
const offsets = ledFrameOffsets(N);
const ledFrames = zip(oscis, offsets).map(([osci, offset]) => {
    const led = new Uint8ClampedArray(binaryBuffer, offset, FRAME_SIZE);
    led[0] = 0xFF;
    const OsciChannelObserver = ({x, i, z, v, a, idle}) => {
        led[i + 1] = clamp(z);
    }
    // Fire em up
    osci(times(() => [OsciRandomInits(), OsciChannelObserver], CHANNELS));
    return led;
});


const spi = SPI.initialize(SPI_PORT);

function write() {
    spi.write(new Buffer(buffer), () => { });
}

setInterval(write, 5);
