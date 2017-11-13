const gulp      = require('gulp');              // Local gulp lib
const gsass     = require('gulp-sass');         // To compile sass & scss files
const gcsso     = require('gulp-csso');         // To compile optimize css
const gwebpack  = require('webpack-stream');    // To use webpack with gulp
const gutil     = require('gulp-util');         // To log anything gulp style
const gmaps     = require('gulp-sourcemaps');   // To generate Sass source maps
const grev      = require('gulp-rev');          // To mark files for cache busting
const grep      = require('gulp-replace');      // To correct fonts paths
const grevrep   = require('gulp-rev-replace');  // To automatize cache busted imports

const del       = require('del');               // To erase some file during cleaning tasks
const path      = require('path');              // To manage path expressions correctly
const webpack   = require('webpack');           // Local webpack lib
const notifier  = require('node-notifier');     // To show notifications
const merge     = require('merge-stream');      // To merge several streams


require('colors');

/****************************
 * CONFIG
 ****************************/

const wpconf          = require('./webpack.config.js');         // Local webpack config
const DEV             = process.env.BULL_BUILD_MODE === 'dev';  // Dev mode or not
const PROD            = process.env.BULL_BUILD_MODE === 'prod'; // Prod mode or not
const SRC_ROOT        = 'src';
const DIST_ROOT       = 'dist';
const ASSETS_FOLDER   = 'assets';
const LIBS_FOLDER     = 'libs';
const DIST_ASSETS     = path.join(DIST_ROOT, ASSETS_FOLDER);
const ASSETS_ROOT     = path.join(SRC_ROOT, ASSETS_FOLDER);
const LIBS_ROOT       = path.join(SRC_ROOT, LIBS_FOLDER);

const features = [
  '.',
  // 'disclaimer',
  // '50x',
  // '404'
];


/****************************
 * PUBLIC TASKS
 ****************************/

/**
 * Builds all files needed.
 * If the build mode is set to dev it also enables
 * build notifications and sources watchers.
 */
gulp.task('build', (done) => {
  gulp.parallel(buildHtml, buildSass, buildAssets)((error) => {
    let next = [buildJs];
    if(DEV) {
      next.push('watch');
      let notifierOptions = {
        title: 'Bull.sh builder',
        sound: false
      };
      notifierOptions.message = error ? '[ERROR] Build failed. See terminal.' : 'Build successful.';
      // notifierOptions.icon = error ? path.join(__dirname, ASSETS_ROOT, 'images/logo-black.png') : path.join(__dirname, ASSETS_ROOT, 'images/logo.png');
      notifier.notify(notifierOptions);
      gulp.parallel(next)(done);
    } else if(PROD) {
      next.push(cacheBust);
      gulp.series(next)(done);
    } else {
      error = new Error('BULL_BUILD_MODE must either be \'dev\' or \'prod\'');
    }

    if(error) {
      gutil.log('[ERROR]'.red, error);
      done();
    }
  });
});

/**
 * Cleans the dist folder by removing it.
 */
gulp.task('clean', () => {
  return del(DIST_ROOT);
});

/**
 * Cleans the node_modules folder by removing it.
 */
gulp.task('clean:node_modules', () => {
  return del('node_modules');
});

/**
 * Watches all .sass .scss .pug files and assets folder,
 * and re-compiles/copies them when they change.
 */
gulp.task('watch', () => {
  process.env.SNFX_WATCH = true;
  gulp.watch([path.join(SRC_ROOT, '/**/*.scss'), path.join(SRC_ROOT, '/**/*.sass')], buildSass);
  gulp.watch([path.join(SRC_ROOT, '/**/*.html')], buildHtml);
  gulp.watch([path.join(ASSETS_ROOT, '/**/*')], buildAssets);
});

/****************************
 * PRIVATE TASKS
 ****************************/

/**
 * Compiles TypeScript files from src/
 * using the typings.
 */
function buildJs() {
  return gulp
    .src([path.join(SRC_ROOT, '/**/*.js')])
    .pipe(gwebpack(wpconf, webpack))
    .pipe(gulp.dest(DIST_ROOT));
}
Object.defineProperty(buildJs, 'name', {value: 'build:js'});

/**
 * Compiles Sass (.scss) files.
 */
function buildSass() {
  let error = null;
  let stream = gulp
    .src(buildEntries('scss'), {base: path.join(process.cwd(), SRC_ROOT)})
    .pipe(gmaps.init({loadMaps: true, largeFile: true}))
    .pipe(gsass({
      includePaths: [
        path.join(__dirname, 'node_modules')
      ]
    }))
    .pipe(grep(/"[A-z./0-9-]*fonts\/([^"]*)"/g, '"assets/fonts/$1"'));

  if(PROD) {
    stream
      .pipe(gcsso())
      .pipe(grev());
  }

  stream
    .on('error', function(err) {
      error = err;
      gutil.log('[ERROR]'.red, error.message);
      this.emit('end');
    })
    .on('end', () => notify('Sass', error))
    .pipe(gmaps.write('.', {destPath: DIST_ROOT}))
    .pipe(gulp.dest(DIST_ROOT));

  if(PROD) {
    stream
      .pipe(grev.manifest({
        path: 'manifest.css.json'
      }))
      .pipe(gulp.dest(DIST_ROOT));
  }

  return stream;
}
Object.defineProperty(buildSass, 'name', {value: 'build:sass'});

/**
 * Copy html files to the dist folder.
 */
function buildHtml() {
  let error = null;
  return gulp
    .src(buildEntries('html'), {base: path.join(process.cwd(), SRC_ROOT)})
    .on('error', function(err) {
      error = err;
      gutil.log('[ERROR]'.red, error.message);
      this.emit('end');
    })
    .on('end', () => notify('Html', error))
    .pipe(gulp.dest(DIST_ROOT));
}
Object.defineProperty(buildHtml, 'name', {value: 'build:html'});

/**
 * Copies static files (e.g. pictures, .ico and things needed)
 * into the dist folder.
 */
function buildAssets() {
  let error = null;
  return merge(
      gulp.src(path.join(ASSETS_ROOT, '/**/*'), {base: SRC_ROOT}),
      gulp.src(path.join(LIBS_ROOT, 'sass/images/*'), {base: path.join(LIBS_ROOT, 'sass')}),
      gulp.src(path.join('node_modules', 'font-awesome/fonts/*'), {base: path.join('node_modules', 'font-awesome')}))
    .on('error', function(err) {
      error = err;
      gutil.log('[ERROR]'.red, error.message);
      this.emit('end');
    })
    .on('end', () => notify('Assets', error))
    .pipe(gulp.dest((file) => {
      return file.base === SRC_ROOT ? DIST_ROOT : DIST_ASSETS;
    }));
}
Object.defineProperty(buildAssets, 'name', {value: 'build:assets'});

/**
 * Replace the imports tags in HTML using revision numbers
 * to cache bust css and js assets.
 */
function cacheBust() {
  return gulp
    .src(buildEntries('html').map((out) => out.replace(SRC_ROOT, DIST_ROOT)), {base: SRC_ROOT})
    .pipe(grevrep({
      manifest: gulp.src(path.join(DIST_ROOT, 'manifest.css.json'))
    }))
    .pipe(grevrep({
      manifest: gulp.src(path.join(DIST_ROOT, 'manifest.js.json'))
    }))
    .pipe(gulp.dest(DIST_ROOT));
}
Object.defineProperty(cacheBust, 'name', {value: 'build:cache-bust'});


/****************************
 * HELPERS
 ****************************/

/**
 * A generic function to send a notification to the user.
 * @param module The module's name.
 * @param error An optional error object.
 */
function notify(module, error) {
  if(DEV && process.env.SNFX_WATCH) {
    let notifierOptions = {
      title: `Bull.sh builder - ${module}`,
      sound: false
    };
    notifierOptions.message = error ? `[ERROR] ${module} build failed. See terminal.` : `${module} build successful.`;
    // notifierOptions.icon = error ? path.join(__dirname, ASSETS_ROOT, 'images/logo-black.png') : path.join(__dirname, ASSETS_ROOT, 'images/logo.png');
    notifier.notify(notifierOptions);
  }
}

/**
 * A generic function to build entry points of a given
 * file extension, based on Sn0wFox.com features.
 * @param ext The extension to build entry points for.
 * @returns {Array} The array of entry points.
 */
function buildEntries(ext) {
  return features.map((feature) => {
    return path.join(SRC_ROOT, feature, 'index.' + ext)
  });
}