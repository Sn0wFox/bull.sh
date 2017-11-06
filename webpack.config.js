const path    = require('path');
const webpack = require('webpack');

const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin     = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin  = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackNotifierPlugin = require('webpack-build-notifier');
const ManifestPlugin        = require('webpack-manifest-plugin');

const PROD  = process.env.BULL_BUILD_MODE === 'prod';
const DEV   = process.env.BULL_BUILD_MODE === 'dev';
const DEBUG = !!process.env.BULL_DEBUG_MODE;

/**
 * The following config will be different for dev and prod mode.
 * Everything is based on the environment variable BULL_BUILD_MODE's value:
 *    - dev             : config for dev mode.
 *    - prod            : config for prod mode.
 */
module.exports = {
  entry: {
    vendor: ['jquery'],
    home: './src/index.js'
  },

  output: {
    publicPath: '',
    path: path.resolve(__dirname, './dist'),
    filename: PROD ? '[name].[hash].js' : '[name].js',
    sourceMapFilename: PROD ? '[name].[hash].map' : '[name].map'
  },

  resolve: {
    extensions: [ '.js' ],
    modules: [ path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src/libs/js') ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  plugins: (() => {
    // Default plugins
    let plugins = [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        skel: 'skel.min',
        'window.skel': 'skel.min',
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChinks: 2
      }),

      new ProgressBarPlugin()
    ];

    // Prod only plugins
    if(PROD) {
      plugins.push(new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }));

      plugins.push(new UglifyJSPlugin({
        compress: true,
        mangle: true,
        sourceMap: true
      }));

      plugins.push(new ManifestPlugin({
        fileName: 'manifest.js.json'
      }));

      // TODO: remove (see prod warning)
      plugins.push(new webpack.optimize.DedupePlugin());
    }

    // Dev only plugins
    if(DEV) {
      plugins.push(new WebpackNotifierPlugin({
        title: 'Bull.sh builder - Webpack',
        sound: false,
        // logo: path.resolve(__dirname, 'src/assets/images/logo.png'),
        // successIcon: path.resolve(__dirname, 'src/assets/images/logo.png'),
        // warningIcon: path.resolve(__dirname, 'src/assets/images/logo-black.png'),
        // failureIcon: path.resolve(__dirname, 'src/assets/images/logo-black.png'),
        messageFormatter: (err) => err.message.replace(/\n/, '\r').replace(/    /, '')
      }));
    }

    // Debug only plugins
    if(DEBUG) {
      plugins.push(new BundleAnalyzerPlugin());
    }

    return plugins;
  })(),

  devtool: 'source-map',

  stats: PROD ? undefined : {
    errorDetails: true
  },

  watch: DEV,
  watchOptions: {
    aggregateTimeout: 400,
    ignored: /node_modules/
  }
};