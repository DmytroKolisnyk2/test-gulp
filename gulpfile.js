"use strict";
const resultFolder = "build";
const sourceFolder = "src";
const path = {
  build: {
    html: resultFolder + "/",
    css: resultFolder + "/css/",
    js: resultFolder + "/js/",
    img: resultFolder + "/img/",
    fonts: resultFolder + "/fonts/",
  },
  src: {
    html: sourceFolder + "/*.html",
    css: sourceFolder + "/scss/style.scss",
    js: sourceFolder + "/js/script.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: sourceFolder + "/fonts/*.ttf",
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/scss/**/*.scss",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: resultFolder + "/",
};
const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webp_html = require("gulp-webp-html"),
  // webp_css = require("gulp-webpcss"),
  uglify = require("gulp-uglify-es").default;

const browserSync = (params) => {
  browsersync.init({
    server: {
      baseDir: "./" + resultFolder + "/",
    },
    port: 1234,
    notify: false,
  });
};
const html = () => {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webp_html())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};
const css = () => {
  return (
    src(path.src.css)
      .pipe(
        scss({
          outputStyle: "compressed",
        })
      )
      .pipe(group_media())
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 5 versions"],
          cascade: true,
        })
      )
      .pipe(clean_css())
      // .pipe(
      //   webp_css({
      //     webpClass: ".webp",
      //     noWebpClass: ".no-webp",
      //   })
      // )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  );
};
const js = () => {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(uglify())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
};
const image = () => {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeView: false }],
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};

const watchFiles = (params) => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], image);
};
const clean = (params) => {
  return del(path.clean);
};
const build = gulp.series(clean, gulp.parallel(js, css, html, image));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.image = image;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
