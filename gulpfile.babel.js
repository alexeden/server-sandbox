const gulp = require('gulp');
const ts = require('gulp-typescript');
const debug = require('gulp-debug');
const rimraf = require('rimraf');
const nodemon = require('gulp-nodemon');


export const clean = cb => rimraf('dist', cb);

const tsProject
  = ts.createProject('tsconfig.json');

export const typescript
  = () =>
      tsProject
        .src()
        .pipe(debug({ title: 'ts sources' }))
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('dist'));


export const autorun
  = () =>
      nodemon({
        exec: './node_modules/.bin/electron dist/main.js',
        ext: 'json js',
        quiet: true,
        watch: 'dist',
        env: { }
      });


export const autobuild = () => {
  gulp.watch('./src', typescript);
};

export const build = gulp.series(clean, typescript);

export default gulp.series(build, gulp.parallel(autobuild, autorun));
