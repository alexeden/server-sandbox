import { Dotstar } from './dotstar';
import { Colors } from './colors';
import * as OS from 'os';
import chalk from 'chalk';

(async () => {
  const dotstar = await Dotstar.create({
    devicePath: OS.type() !== 'Linux' ? '/dev/null' : undefined,
    // startFrames: 1,
    endFrames: 1,
  });

  const colors = Object.values(Colors).filter(c => typeof c === 'number');

  console.log(colors);
  // const testInterval = setInterval(
  //   () => {
  //     dotstar.apply((c, i) => colors[Math.floor(Math.random() * colors.length)]);
  //     dotstar.sync();
  //   },
  //   50
  // );

  const set = (cs: number[]) => {
    if (cs.length <= 0) {
      dotstar.off();
      // dotstar.off();
      return;
    }
    // dotstar.apply((c, i) => colors[Math.floor(Math.random() * colors.length)]);
    console.log(`Setting color to "${Colors[cs[0]]}": 0x${cs[0].toString(16)}`);
    dotstar.setAll(cs[0]);
    dotstar.sync();
    if (cs.length > 0) {
      setTimeout(() => set(cs.slice(1)), 500);
    }
  };

  set(colors);
  // )
  // setTimeout(
  //   () => {
  //     // clearInterval(testInterval);
  //     dotstar.off();
  //     console.log(chalk.blue(dotstar.printBuffer()));
  //     console.log(chalk.green('done! everything should be off'));
  //   },
  //   15000
  // );

})();



// const shutdown = () => {
//   console.log('shutting down');
//   write([0, 0, 0]);
// };
// setTimeout(() => write([255, 0, 0]), 0);
// setTimeout(() => write([255, 0x7f, 0]), 1000);
// setTimeout(() => write([0, 255, 0]), 2000);
// setTimeout(() => spi.close(), 2500);
// setTimeout(() => write([0, 255, 255]), 3000);
// setTimeout(() => write([0, 0, 255]), 4000);
// setTimeout(() => write([255, 0, 255]), 5000);
// setTimeout(shutdown, 6000);
