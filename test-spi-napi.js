const spi = require('bindings')('spi_napi.node');

const cb = (...args) => {
  args.forEach((arg, i) => {
    console.log(`Callback argument #${i}: `, arg);
  });
};

try {
  console.log(spi.transfer(cb, {
    fd: 0,
    speed: 4e6,
    mode: 0,
    order: 0,
    buffer: Buffer.of(0, 1, 2, 3, 4, 5, 6, 7),
    readcount: 0,
  }));
}
catch (err) {
  console.error('caught this error: ', err);
}
// console.log('SPI N-API: ', spi.hello("hello"));
// spi.echo('ECHO!', (...args) => {
//   console.log('args: ', ...args);
// });

// (async () => {
//   try {
//     const echo = await spi.echoPromise("hello promise");
//     console.log('echo promise!', echo);
//   }
//   catch (err) {
//     console.error(err);
//   }
// })();
