const path = require('path');
const { fromJS } = require('immutable');
const webpack = require('webpack');
const proxy = require('http-proxy-middleware');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const SriPlugin = require('webpack-subresource-integrity');

const T = require('./util/tpl');
const dc = require('./config');

const Set = require('./webpack.set.entry');
const IsPro = Set.deployType === dc.getProDeployName();
const IsTest = Set.deployType === dc.getDevDeployName();
const IsProduction = process.env.NODE_ENV === 'production';

let CSS_Module_Loader_Pargram, CSS_SourceMap, imgCompress, publicPath;
const vendorLoc = Set.DUAN.length < 2 ? Set.DUAN[0] : 'vendors';

const fileNameHash = IsProduction ? '_[hash:8]' : '';

const kiss_ie8 = true; // Same name as uglify's IE8 option. Turn this on to enable HMR.
const sep = path.sep.replace(/(\/|\\)/g, '\\$1');

const rootDir = path.join(process.cwd(), './src');
const plugins = [
  new ExtractTextPlugin({
    filename: `[name]/main${fileNameHash}.css`,
    allChunks: true
  }),
  //@手动把公共的集中到这里
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendors',
    filename: `${vendorLoc}/vendors${fileNameHash}.js`,
    minChunks: 3
  }),
  /* new webpack.ProvidePlugin({
       $: "jquery",
       jQuery: "jquery",
       "window.jQuery": "jquery",
       "window.Zepto":"jquery"
   }),*/
  new SriPlugin({
    hashFuncNames: ['sha512'],
    enabled: process.env.NODE_ENV === 'production'
  }),
  ...Set.htmlDeclare
];

/* plugin define */
/* istanbul ignore else  */
if (IsProduction) {
  //console.log('目前编译生产环境');
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );
  if (!IsTest) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: !kiss_ie8
        },
        mangle: { screw_ie8: !kiss_ie8 },
        output: { screw_ie8: !kiss_ie8 }
      })
    );
  }

  CSS_Module_Loader_Pargram =
    '?modules&importLoaders=1&localIdentName=[hash:6]';
  CSS_SourceMap = '';
  imgCompress = '!image-webpack-loader';

  if (IsTest) {
    publicPath = T(dc.remotePath, { target: Set.module });
  } else {
    publicPath = path.join(
      IsPro ? dc.cdnDomain : '',
      T(dc.remotePath, {
        target: Set.module
      })
    );
  }
}
// not IsProduction
else {
  //console.log('目前编译开发环境');
  plugins.push(new webpack.HotModuleReplacementPlugin());

  CSS_Module_Loader_Pargram =
    '?modules&importLoaders=1&localIdentName=[path]__[name]__[local]__[hash:3]';
  CSS_SourceMap = '?sourceMap';
  imgCompress = '';
  publicPath = T(dc.remotePath, { target: Set.module });
}

/* loader config define */
const postcssConf = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    sourceMap: true,
    plugins: loader => [
      require('autoprefixer')()
      // 不能使用cssnano。require.ensure时，需要ExtractTextPlugin的allChunks: true，fallback 走style-loader, 导致cssnano改keyFrame名字时重复了。。
      //require('cssnano')()
    ]
  }
};

const htmlLoaderOpt = {
  minimize: IsProduction,
  ignoreCustomFragments: [/{{.*?}}/],
  root: rootDir,
  attrs: ['img:src', 'img:data-src', 'link:href']
};

const babelPlugin = [
  '@babel/plugin-transform-runtime',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-object-assign'
  //'@babel/plugin-syntax-dynamic-import'
];
const picUrlLoaderOpt = {
  loader: 'file-loader',
  options: {
    name: '/img/[name]_[hash:5].[ext]' /*+ imgCompress*/
  }
};

/***** (⁎⁍̴̛ᴗ⁍̴̛⁎) *****/

const webpackConfig = {
  context: path.resolve('./'),
  entry: Object.assign({}, Set.entry),
  output: {
    path: path.resolve(Set.outputDir, Set.module),
    filename: `[name]/bundle${fileNameHash}.js`,
    publicPath,
    chunkFilename: `${vendorLoc}/chunk_[name]${fileNameHash}.js`,
    crossOriginLoading: 'anonymous'
  },
  resolve: {
    modules: ['node_modules', rootDir],
    extensions: ['.js', '.jsx'],
    alias: {}
  },
  plugins,
  module: {
    rules: [
      //#region js,sw
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|sw.js)/,
        //include:/node_modules\/fow-encrypt/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              '@babel/preset-env' /*'@babel/preset-stage-0' ie8 will crash*/
            ],
            plugins: babelPlugin
          }
        }
      },
      {
        test: /sw\.js$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /manifest\.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.jsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              '@babel/preset-env',
              '@babel/preset-react' /*'@babel/preset-stage-0' ie8 will crash*/
            ],
            plugins: babelPlugin
          }
        }
      },
      IsProduction && kiss_ie8
        ? {
            test: /\.jsx?$/,
            enforce: 'post',
            loader: 'es3ify-loader'
          }
        : {},
      //#endregion
      //#region css
      {
        test: /\.css$/,
        exclude: /http/,
        use: !IsProduction
          ? ['style-loader', 'css-loader', 'resolve-url-loader']
          : /*[MiniCssExtractPlugin.loader, 'css-loader', 'resolve-url-loader']*/
            ExtractTextPlugin.extract({
              fallback: ['style-loader'],
              use: ['css-loader', postcssConf, 'resolve-url-loader']
            })
      },
      {
        test: /\.scss$/,
        exclude: /http/,
        use: !IsProduction
          ? ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
          : /*[MiniCssExtractPlugin.loader, 'css-loader', 'resolve-url-loader', 'sass-loader']*/
            ExtractTextPlugin.extract({
              fallback: ['style-loader'],
              use: [
                'css-loader',
                postcssConf,
                'resolve-url-loader',
                'sass-loader'
              ]
            })
      },
      //#endregion
      //#region pic
      {
        test: /\.(png|gif)$/,
        exclude: /http|iso/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              name: '/img/[name]_[hash:5].[ext]' /*+ imgCompress*/
            }
          }
        ]
      },
      {
        test: /\.iso.(png|gif)$/,
        exclude: /http/,
        use: [picUrlLoaderOpt]
      },
      {
        test: /\.jpe?g|svg$/,
        exclude: /http/,
        use: [picUrlLoaderOpt]
      },
      //#endregion
      //#region tpl
      {
        test: /\.handlebars$/,
        exclude: new RegExp(`resource${sep}html`),
        use: [
          {
            loader: 'handlebars-loader',
            options: { debug: false, helperDirs: [...Set.helperDirs] }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'html-loader',
            options: htmlLoaderOpt
          }
        ]
      },
      {
        test: new RegExp(`resource${sep}html${sep}.+\\.handlebars$`),
        use: [
          {
            loader: 'handlebars-loader'
          }
        ]
      },
      {
        test: /\.tmpl$/,
        use: {
          loader: 'html-loader',
          options: htmlLoaderOpt
        }
      },
      //为了解决html修改后不会自动reload的问题
      {
        test: /index.html$/,
        use: {
          loader: 'html-loader'
        }
      },
      //#endregion
      {
        test: /\.(woff|woff2|eot|ttf|pdf)$/,
        exclude: /http/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1,
              name: '/font/[name]_[hash:5].[ext]'
            }
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(process.cwd(), './build'),
    publicPath: '',
    hot: true,
    inline: true,
    port: dc.servePort,
    before(app) {
      // 代理筛选
      dc.proxyFilterPathname &&
        app.get(
          dc.proxyFilterPathname,
          proxy({
            target: `http://localhost:${dc.proxyPort}`,
            changeOrigin: true
          })
        );
    },
    allowedHosts: ['.'] // allow all
  }
  /*imageWebpackLoader: {
      mozjpeg: {
          quality: 100
      },
      pngquant: {
          quality: "60-100",
          speed: 4
      },
      svgo: {
          plugins: [
              {
                  removeViewBox: false
              }, {
                  removeEmptyAttrs: false
              }
          ]
      }
  }*/
};
if (process.env.NODE_ENV !== 'production') {
  webpackConfig.devtool = '#inline-source-map';
} else if (IsTest) {
  webpackConfig.devtool = 'eval';
}

//fromJS toJS
const mergedConfig = fromJS(webpackConfig)
  .mergeDeep(dc.webpackConfig)
  .toJS();

module.exports = mergedConfig;
