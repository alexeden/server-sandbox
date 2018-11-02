import { Dotstar, Colors, APA102C } from 'dotstar-node';
import * as OS from 'os';
import chalk from 'chalk';

(async () => {
  try {
    const dotstar = await Dotstar.create({
      devicePath: OS.type() !== 'Linux' ? '/dev/null' : undefined,
      clockSpeed: APA102C.CLK_MAX,
    });


    const colors = Object.values(Colors).filter(c => typeof c === 'number');
    const testInterval = setInterval(
      () => {
        dotstar.apply((c, i) => colors[Math.floor(Math.random() * colors.length)]);
        dotstar.sync();
      },
      5
    );

    setTimeout(
      () => {
        clearInterval(testInterval);
        dotstar.shutdown();
        console.log(chalk.green('done! everything should be off'));
      },
      5000
    );
  }
  catch (error) {
    console.error(error);
  }

})();
