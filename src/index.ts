import { Dotstar } from './dotstar';
import { Colors } from './colors';
import * as OS from 'os';
import chalk from 'chalk';

(async () => {
  const dotstar = await Dotstar.create({
    devicePath: OS.type() !== 'Linux' ? '/dev/null' : undefined,
    startFrames: 4,
    endFrames: 4,
  });


  const testInterval = setInterval(
    () => {
      dotstar.apply((c, i) => c + 1);
      dotstar.sync();
    },
    1000
  );

  setTimeout(
    () => {
      clearInterval(testInterval);
      dotstar.off();
      console.log(chalk.blue(dotstar.printBuffer()));
      console.log(chalk.green('done! everything should be off'));
    },
    15000
  );

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
