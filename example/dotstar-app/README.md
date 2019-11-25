Functions:

Lightness sweep: `2 * Math.sin(-1 * Math.PI * ts - pixel.y - pixel.x) - 1.5`

Single hue per edge: `[330, 240, 120, 25, 9, 0][ei]`

Hue traces edges: `[330, 240, 120, 25, 9, 0][Math.floor(Math.abs(6*Math.sin(ts / 2) + 6*i/n)) % 6]`

New hue emanates from edge midpoints: `[330, 240, 120, 25, 9, 0][Math.floor(Math.abs(6*Math.sin(ts / 2) + pixel.dMidpoint))]`
