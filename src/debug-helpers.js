const R = require('ramda');
const chalk = require('chalk');
const util = require('util');

const TAP_ON = false;
const tap = R.curry((label, x) => TAP_ON ? console.log(`${label}: `, x) || x : x);



const trace = data => console.log('trace: ', data) || data;
const inspect = R.curry((msg, obj) => console.log(chalk.blue(`Inspection of ${msg}: `), util.inspect(obj, { depth: 1 })) || obj );
const log = {
    b: (...x) => console.log(chalk.blue(...x)),
    r: (...x) => console.log(chalk.red(...x)),
    g: (...x) => console.log(chalk.green(...x)),
    y: (...x) => console.log(chalk.yellow(...x)),
    w: (...x) => console.log(chalk.white(...x)),
};


module.exports = { trace, inspect, log, tap };
