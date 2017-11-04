var gulp = require( 'gulp' );

// SASS Processing
var concat = require( 'gulp-concat' );
var sass = require( 'gulp-sass' );
var cssnano = require( 'gulp-cssnano' );
var sourcemaps = require( 'gulp-sourcemaps' );
var autoprefixer = require( 'gulp-autoprefixer' );
var rename = require( 'gulp-rename' );

// JS Processing
var stripDebug = require( 'gulp-strip-debug' );
var uglify = require( 'gulp-uglify' );

// Image Processing
var imagemin = require( 'gulp-imagemin' );

// File Management
var del = require( 'del' );

// Browsersync
var browserSync = require( 'browser-sync' ).create();

// Run a Sequence of tasks
var run_sequence = require( 'run-sequence' );

// Project folder paths 
var src = './_src';
var dst = './_dst';

// Task for HTML files
gulp.task( 'html', function() {
    gulp.src( src + '/*.html' )
        .pipe( gulp.dest( dst ) ); // write files
} );

// Task for vendors JS files
gulp.task( 'vendorsJS', function () {
    return gulp.src( ['node_modules/jquery/dist/jquery.slim.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/vue/dist/vue.min.js'] )
        .pipe( gulp.dest( dst + '/js' ) );
} );

// Task for vendors CSS files
gulp.task( 'vendorsCSS', function () {
    return gulp.src( ['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/css/bootstrap.min.css.map'] )
        .pipe( gulp.dest( dst + '/css' ) );
} );

// Task for SASS Files 
gulp.task( 'sass', function() {
    return gulp.src( src + '/scss/**/*.scss' )
        .pipe( sass() ) // gulp-sass
        .pipe( sourcemaps.init() )
        .pipe( autoprefixer( 'last 2 version' ) ) // gulp-autoprefixer
        .pipe( cssnano() ) // cssnano
        .pipe( rename( { // add min to file name
            suffix: '.min'
        } ) )
        .pipe( sourcemaps.write( '.' ) ) // gulp-sourcemaps
        .pipe( gulp.dest( dst + '/css' ) ); // write files
} );

// Task for JS Files
gulp.task( 'scripts', function() {
    return gulp.src( src + '/js/**/*.js' )
        .pipe( sourcemaps.init() )
        .pipe( stripDebug() )
        .pipe( uglify() )
        .pipe( concat( 'app.min.js' ) )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest( dst + '/js' ) );
} );

// Task for Images
gulp.task( 'images', function() {
    return gulp.src( src + '/images/**/*.{gif,jpg,png,svg}' )
        .pipe( imagemin( [
            imagemin.gifsicle( {
                interlaced: true
            } ),
            imagemin.jpegtran( {
                progressive: true
            } ),
            imagemin.optipng( {
                optimizationLevel: 5
            } ),
            imagemin.svgo( {
                plugins: [{
                    removeViewBox: true
                }]
            } )
        ] ) )
        .pipe( gulp.dest( dst + '/images' ) );
} );

// Task to reset dst folder
gulp.task( 'clean', function( done ) {
    return del( [dst], done );
} );


// Task for Build
gulp.task( 'build', function( done ) {
    run_sequence( 'clean', ['html', 'images', 'scripts', 'sass', 'vendorsJS', 'vendorsCSS'], done );
} );

// Task for Loading Browsersync and watching for project changes
gulp.task( 'serve', ['build'], function() {
    browserSync.init( {
        server: dst
    } );
    gulp.watch( src + '/**/*.*', ['build'] );
    gulp.watch( dst + '/*.html' ).on( 'change', browserSync.reload );
} );

// Task for Default
gulp.task( 'default', ['serve'] );