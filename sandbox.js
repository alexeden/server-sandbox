const chalk = require('chalk');
const ramda = require('ramda');

const portlist = require('./portlist.js');

portlist.list().then(ports => {
    console.log(ports);
});
