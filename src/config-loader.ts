import { readFileSync } from 'fs';
/**
*   Program settings
*/
export const settings = JSON.parse(readFileSync('dist/config.json', { encoding: 'utf8' }));
