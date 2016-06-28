const R = require('ramda');

/**
*   Program settings
*/
const settings = JSON.parse(require('fs').readFileSync('./light-strip.config.json', { encoding: 'utf8' }));



/**
*   Randomization helpers
*/
const multiplyByRandom = x => x * Math.random();
const randomIndex = R.compose(Math.floor, multiplyByRandom, R.length, R.defaultTo([]))
const randomElement = (data = []) => (R.isArrayLike(data) ? data[randomIndex(data)] : data[Object.keys(data)[randomIndex(Object.keys(data))]]);


module.exports = settings;
