import { write } from './dotstar';

const shutdown = () => {
  console.log('shutting down');
  write([0, 0, 0]);
};
setTimeout(() => write([255, 0, 0]), 0);
setTimeout(() => write([255, 0x7f, 0]), 1000);
setTimeout(() => write([0, 255, 0]), 2000);
setTimeout(() => write([0, 255, 255]), 3000);
setTimeout(() => write([0, 0, 255]), 4000);
setTimeout(() => write([255, 0, 255]), 5000);
// setTimeout(() => write([255, 0, 0]), 6000);
// setTimeout(() => write([255, 0, 0]), 7000);
// setTimeout(() => write([255, 0, 0]), 8000);
// setTimeout(() => write([255, 0, 0]), 9000);
setTimeout(shutdown, 6000);
// process.once('SIGUSR2', () => {
//   shutdown();
//   process.kill(process.pid, 'SIGUSR2');
// });
// process.on('SIGINT', () => {
//   console.log('shutting down');
//   shutdown();
// });
