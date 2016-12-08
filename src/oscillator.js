const R = require('ramda');
const {always} = R;
const { PHYSICS: { k, m, c, fps } } = require('./config-loader.js');

/*
* The oscillator model
* phys: object of getter functions for the necessary physical constants (m, k, c)
* x: integer of the osci's physical address
* tk: a reference to an observable timekeeper for triggering model updates
* channels: array of channel objects where each channel object has the form:
*	{
*		model: object containing the initial position and velocity values (z, v)
*		observer: function to be called with each channel update containing the new model values
*	}
*/
const Osci = R.curry((phys, x, tk, channels) => channels.map(([model, observer], i) => {
  // Pull out the initial values
  let {z = 0, v = 0} = model;

  // Update function for updating physical values and passing to observers
  tk.observe(dt => {
    const idle = (0.5 * (phys.k() * Math.pow(z, 2) + phys.m() * Math.pow(v, 2))) < 0.1;
    const Fs = -phys.k() * z;
    const Ff = -phys.c() * v;
    const a = idle ? 0 : (Fs + Ff) / phys.m();
    v = idle ? 0 : a*dt+v;
    z = idle ? 0 : v * dt + z;
    // Send the recalculated properties to observers
    observer({ x, i, z, v, a, idle});
  });
}));

// Curry the oscillator model with its physics model before exporting
module.exports = Osci({
  k: always(k),
  m: always(m),
  c: always(c),
  fps: always(fps)
});
