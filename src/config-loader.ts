import { readFileSync } from 'fs';
/**
*   Program settings
*/
export const settings = JSON.parse(readFileSync('./config.json', { encoding: 'utf8' }));
