const path    = require('path');
const webpack = require('webpack');

const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin     = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin  = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackNotifierPlugin = require('webpack-build-notifier');
const ManifestPlugin        = require('webpack-manifest-plugin');
const DirectoryNamedlugin   = require('directory-named-webpack-plugin');

const PROD  = process.env.BULL_BUILD_MODE === 'prod';
const DEV   = process.env.BULL_BUILD_MODE === 'dev';
const DEBUG = !!process.env.BULL_DEBUG_MODE;

const pages = [
  'communication',
  'finances',
  'gestion',
  'marketing',
  'responsabilites',
  'sociologie'
];

/**
 * The following config will be different for dev and prod mode.
 * Everything is based on the environment variable BULL_BUILD_MODE's value:
 *    - dev             : config for dev mode.
 *    - prod            : config for prod mode.
 */
module.exports = {
  entry: buildEntries(pages),

  output: {
    publicPath: '',
    path: path.resolve(__dirname, './dist'),
    filename: PROD ? '[name].[hash].js' : '[name].js',
    sourceMapFilename: PROD ? '[name].[hash].map' : '[name].map'
  },

  resolve: {
    extensions: [ '.js' ],
    modules: [ path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src/libs/js') ],
    alias: {
      'jquery-panel$': path.resolve(__dirname, 'src/libs/js/util.js')
    },
    plugins: [
      new DirectoryNamedlugin({
        honorIndex: true
      })
    ]
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
        uglifyOptions: {
          mangle: true,
          compress: true
        },
        sourceMap: true
      }));

      plugins.push(new ManifestPlugin({
        fileName: 'manifest.js.json'
      }));

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

/**
 * Build the entry object of the webpack configuration,
 * using the vendor module and the home page along with
 * each other given pages.
 * @param pages Array The list of all other pages to build.
 * @return Object The entry for the webpack config.
 */
function buildEntries(pages) {
  let entries = {
    vendor: ['jquery', 'jquery.scrollex', 'skel.min', 'skel-util'],
    home: './src/index.js'
  };

  for(let page of pages) {
    entries[path.join(page, 'index')] = `./src/${page}/index.js`
  }

  return entries;
}