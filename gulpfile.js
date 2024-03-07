const gulp = require('gulp');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const server = require('browser-sync').create();
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const del = require('del');
const svgstore = require('gulp-svgstore');

const html = () => {
  return gulp.src('source/html/*.html')
      .pipe(gulp.dest('build'));
};

const css = () => {
  return gulp.src('source/css/style.css')
      .pipe(plumber())
      .pipe(postcss([autoprefixer({
        grid: true,
      })]))
      .pipe(gulp.dest('build/css'))
      .pipe(csso())
      .pipe(rename('style.min.css'))
      .pipe(gulp.dest('build/css'))
      .pipe(server.stream());
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,webp}', {base: 'source'})
    .pipe(gulp.dest('build'));
};

const sprite = () => {
  return gulp.src('source/img/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite_auto.svg'))
    .pipe(gulp.dest('build/img'));
};

const copy = () => {
  return gulp.src([
    'source/fonts/**',
      'source/img/**'
    ], {
    base: 'source',
  })
      .pipe(gulp.dest('build'));
};

const clean = () => {
  return del('build');
};

const syncServer = () => {
  server.init({
    server: 'build/',
    index: 'index.html',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/pug/**/*.html', gulp.series(html, refresh));
  gulp.watch('source/sass/**/*.css', gulp.series(css));
  gulp.watch('source/img/**/*.svg', gulp.series(sprite, html, refresh));
  gulp.watch('source/img/**/*.{png,jpg,webp}', gulp.series(copyImages, html, refresh));
};

const refresh = (done) => {
  server.reload();
  done();
};

const start = gulp.series(clean, copy, sprite, css, html, syncServer);

const build = gulp.series(clean, copy, sprite, css, html);

exports.start = start;
exports.build = build;
