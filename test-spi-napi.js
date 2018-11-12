const spi = require('bindings')('spi_napi.node');
console.log('SPI N-API: ', spi.hello("hello"));
spi.echo('ECHO!', (...args) => {
  console.log('args: ', ...args);
});

(async () => {
  try {
    const echo = await spi.echoPromise("hello promise");
    console.log('echo promise!', echo);
  }
  catch (err) {
    console.error(err);
  }
})();
