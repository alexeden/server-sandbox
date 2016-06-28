const util = require('util');
const assert = require('assert');

const R = require('ramda');
const {__} = R;

const loop = R.curry((len, i) => R.cond([
    [R.lt(__, 0), i => loop(len, i+len)],
    [R.gte(__, len), i => loop(len, i-len)],
    [R.T, i => i]
])(i));

const dec = R.curry((len, i) => loop(len, i - 1));
const inc = R.curry((len, i) => loop(len, i + 1));

const CircularIndex = {
    init(size, i0) {
        assert(util.isNumber(size), `First argument (size) to CircularIndex must be a number!`);
        this.size = size;
        this.i = parseInt(i0) || 0;
        this.loop = loop(size);
        return this;
    },
    dec() {
        return this.i = dec(this.size, this.i);
    },
    inc() {
        return this.i = inc(this.size, this.i);
    },
    get() {
        return this.i;
    },
    is(val) {
        return this.i === val;
    },
    odd() {
        return (this.i % 2) !== 0;
    },
    even() {
        return !this.odd();
    }
}


module.exports = {
    create(...args) {
        return Object.create(CircularIndex).init(...args);
    }
}
