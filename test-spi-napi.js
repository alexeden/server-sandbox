const spi = require('bindings')('spi_napi.node');
console.log('SPI N-API: ', spi.hello("hello"));
