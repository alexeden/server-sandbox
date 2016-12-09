const gulp = require('gulp');
const ts = require('gulp-typescript');
const debug = require('gulp-debug');
const rimraf = require('rimraf');
const nodemon = require('gulp-nodemon');
const flatten = require('gulp-flatten');


const paths =
  { ts: 'src/**/*.ts'
  , json: 'src/**/*.json'
  };


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

export const data
  = () =>
      gulp
        .src(paths.json)
        .pipe(flatten())
        .pipe(debug({ title: 'json data' }))
        .pipe(gulp.dest('dist'));

export const autorun
  = () =>
      nodemon({
        exec: 'node dist/index.js',
        ext: 'json js',
        quiet: true,
        watch: 'dist',
        env: { }
      });


export const autobuild = () => {
  gulp.watch(paths.ts, typescript);
  gulp.watch(paths.json, data);
};

export const build = gulp.series(clean, data, typescript);

export default gulp.series(clean, build, gulp.parallel(autobuild, autorun));
