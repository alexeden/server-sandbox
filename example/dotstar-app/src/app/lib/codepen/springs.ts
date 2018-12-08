// Resolution of simulation
const NUM_POINTS = 50;
// Spring constant for forces applied by adjacent particles
const SPRING_CONSTANT = 0.004;
// Sprint constant for force applied to baseline
const SPRING_CONSTANT_BASELINE = 0.005;
// Damping to apply to speed changes
const DAMPING = 0.981;
// Draw radius for wave particles
const POINT_RADIUS = 4;
// Mass
const POINT_MASS = 0.5;
// Device pixel ratio
const DPR = window.devicePixelRatio || 1;
// Canvas padding
const PADDING = 20 * DPR;


/*------------------------------*\
|* Wave
\*------------------------------*/

class Wave {
  readonly particles: Particle[];

  constructor(
    readonly segments: number,
    readonly p1: Particle,
    readonly p2: Particle
  ) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const vx = dx / (this.segments - 1);
    const vy = dy / (this.segments - 1);
    this.particles = new Array(this.segments).fill(null).map((p, i) =>
      new Particle(
        p1.x + vx * i,
        p1.y + vy * i
      )
    );
  }
}

/*------------------------------*\
|* Particle
\*------------------------------*/

class Particle {
  vx = 0;
  vy = 0;

  constructor(
    public x = 0,
    public y = 0,
    public mass = POINT_MASS
  ) {}

  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  moveTo(...args: number[]) {
    this.x = args[0];
    this.y = args[1];
  }
}


/*------------------------------*\
|* Main Canvas
\*------------------------------*/

class Canvas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly wave: Wave;
  readonly mouse = {
    x: 0,
    y: 0,
    mousedown: false,
  };
  tick = 0;

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(DPR, DPR);

    this.canvas.width = window.innerWidth * DPR;
    this.canvas.height = window.innerHeight * DPR;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';

    const y = this.canvas.height / 2;
    const p1 = new Particle(PADDING, y);
    const p2 = new Particle(this.canvas.width - PADDING, y);
    this.wave = new Wave(NUM_POINTS, p1, p2);

    window.addEventListener('mousedown', () => this.mouse.mousedown = true);
    window.addEventListener('mouseup', () => this.mouse.mousedown = false);
    window.addEventListener('mousemove', this.handleMouse.bind(this));
    window.addEventListener('click', this.handleMouse.bind(this));

    this.triggerWave(this.canvas.width / 2, this.canvas.height);

    this.render();
  }

  updateWave() {
    this.wave.particles.forEach((p, n, particles) => {
      const leftIndex = n === 0 ? particles.length - 1 : n - 1;
      const rightIndex = n === particles.length - 1 ? 0 : n + 1;
      const forceFromLeft = SPRING_CONSTANT * (particles[leftIndex].y - p.y);
      const forceFromRight = SPRING_CONSTANT * (particles[rightIndex].y - p.y);
      const forceToBaseline = SPRING_CONSTANT_BASELINE * (this.canvas.height / 2 - p.y);

      // Total force to apply to this point
      const force = forceFromLeft + forceFromRight + forceToBaseline;

      // Calculate acceleration
      const acceleration = force / p.mass;

      // Apply acceleration (with damping)
      p.vy = DAMPING * p.vy + acceleration;

      // Apply speed
      p.y = p.y + p.vy;
    });
  }

  render() {
    this.drawBackground();
    this.drawText();
    this.drawCurve();
    this.drawSpring();
    this.drawVerts();
    this.drawMouse();
    this.updateWave();
    if (this.mouse.mousedown) this.triggerWave(this.mouse.x, this.mouse.y);
    this.tick++;
    window.requestAnimationFrame(this.render.bind(this));
  }

  handleMouse({ clientX, clientY }: MouseEvent) {
    this.mouse.x = clientX * DPR;
    this.mouse.y = clientY * DPR;
  }

  triggerWave(x: number, y: number) {
    let closestPoint = {};
    let closestDistance = -1;
    let idx = 0;

    const particles = this.wave.particles;

    particles.forEach((p, n) => {
      const distance = Math.abs(x - p.x);
      if (closestDistance === -1 || distance <= closestDistance) {
        closestPoint = p;
        closestDistance = distance;
        idx = n;
      }
    });

    const halfHeight = this.canvas.height / 2;
    // update the wave point closest to the mouse to start a wave
    const dy = y - halfHeight; // delta y from baseline
    const spread = 4; // number of particles to affect from closest point
    const mod = (idx - spread) % particles.length; // modulus
    const start = mod < 0 ? particles.length + mod : mod; // starting idx accounting for negatives
    const length = spread * 2 + 1; // number of particles total

    let rad = 0; // start radian
    const radInc = Math.PI / length; // radians bases on total length

    for (let n = 0; n < length; n++) {
      const i = (start + n) % particles.length;
      const point = particles[i];
      const pow = Math.sin(rad) * dy + halfHeight; // power determined by delta y from baseline
      point.y = pow;
      rad += radInc;
    }
  }

  get yAvg() {
    return this.wave.particles.reduce((sum, { y }) => sum + y, 0) / this.wave.particles.length;
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#a6c1ee');
    gradient.addColorStop(1, '#00ecbc');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawText() {
    const size = this.canvas.width / 10;
    this.ctx.font = `bold ${size}px Futura`;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('Springs', this.canvas.width / 2, this.yAvg - size / 2);
  }

  drawCurve() {
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 3 * DPR;
    this.ctx.strokeStyle = '#b224ef';

    this.ctx.beginPath();
    this.ctx.moveTo(this.wave.particles[0].x, this.wave.particles[0].y);

    for (let k = 0; k < this.wave.particles.length - 1; k++) {

      const p1 = this.wave.particles[k];
      const p2 = this.wave.particles[k + 1];

      if (k === this.wave.particles.length - 2) {
        this.ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
      }
      else {
        const cpx = (p1.x + p2.x) / 2;
        const cpy = (p1.y + p2.y) / 2;
        this.ctx.quadraticCurveTo(p1.x, p1.y, cpx, cpy);
      }

    }

    this.ctx.stroke();
  }

  drawSpring() {
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 3 * DPR;
    this.ctx.strokeStyle = '#8c6eef';

    this.wave.particles.forEach((p1, k) => {
      const p2 = {
        x: p1.x,
        y: this.canvas.height - 60 * DPR,
      };
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      const coils = this.canvas.height / 20;
      const dy = p2.y - p1.y;
      const dist = dy / coils;

      for (let n = 1; n <= coils; n++) {
        const dyn = dist * n;
        let dx = this.canvas.height * 0.004;
        if (n % 2 === 0) dx *= -1;
        this.ctx.lineTo(p1.x + dx, p1.y + dyn);
      }

      this.ctx.stroke();
      this.ctx.closePath();
    });
  }

  drawVerts() {
    this.ctx.lineWidth = 2 * DPR;
    this.ctx.fillStyle = '#8c6eef';
    this.ctx.strokeStyle = '#009efd';

    this.wave.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, POINT_RADIUS * DPR, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawMouse() {
    this.ctx.lineWidth = 2 * DPR;
    this.ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
    this.ctx.strokeStyle = this.mouse.mousedown ? '#330867' : '#89f7fe';
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 16 * DPR, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.stroke();
    this.mouse.mousedown && this.ctx.fill();
  }
}

new Canvas();
