const R = require('ramda');
const {sum} = R;
const util = require('util');
const assert = require('assert');
const d3 = require('d3');
const {tap, log} = require('./debug-helpers.js');
const {PIXICLE, PHYSICS} = require('./config-loader.js');


const GFORCE = R.multiply(PHYSICS.GRAVITY);

const bounce = p => {
	if(p.x0 < 0) {
		p.v0 = Math.sqrt(PHYSICS.BOUNCE * p.KE);
		p.x0 = Math.abs(p.x0);
		// Kill the particle if its energy is dead
		if(p.E < PHYSICS.DEAD_ENERGY) {
			p.v0 = 0;
			p.x0 = 0;
		}
	}
	return p;
}

const Pixicle = {
    m: PIXICLE.MASS,
    reset() {
        this.x0 = 0;
        this.v0 = 0;
        this.t0 = 0;
        return this;
    },
    bounce() {

    },
    tick(t, ...fs) {
        t = t/1000;
		const { m, t0, v0, x0, gforce } = this;
        const F = R.sum([...fs, gforce]);
        const a = F / m;
        const dt = t - t0;
        const v = x0 >= PIXICLE.MAX_X ? 0 : (a*dt) + v0;
        const x = Math.min((v*dt) + x0, PIXICLE.MAX_X);
        // console.log(`${t}s: x ${x}, v ${v}, a ${a}`);
		return bounce(Object.assign(this, { t0: t, x0: x, v0: v}));
    },
	get gforce() {
		return this.x0 <= 0 ? 0 : GFORCE(PIXICLE.MASS);
	},
    get KE() {
		return 0.5 * this.m * Math.pow(this.v0, 2);
    },
    get PE() {
        return this.x0 * this.m * this.gforce;
    },
    get E() {
        return this.KE + this.PE;
    }
};



module.exports = {
    create() {
        return Object.create(Pixicle).reset();
    }
};
