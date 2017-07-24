const path = require("path");

const webpack = require("webpack");
const LiveReloadPlugin = require("webpack-livereload-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require("autoprefixer");

const Set = require("./webpack.set.entry");
const IsPro = Set.PRO_SPECIFIC === "pro";
const IsPre = Set.PRO_SPECIFIC === "pre";
const IsTest = Set.PRO_SPECIFIC === "test";
const IsProduction = process.env.NODE_ENV === "production";

let CSS_Module_Loader_Pargram, CSS_SourceMap, imgCompress, publicPath;
const vendorLoc = Set.DUAN.length < 2 ? Set.DUAN[0] : "vendors";

const fileNameHash = IsProduction ? "_[hash:8]" : "";

let plugins = [
    new ExtractTextPlugin(`[name]/main${fileNameHash}.css`),
    //@手动把公共的集中到这里
    new webpack.optimize.CommonsChunkPlugin("vendors", `${vendorLoc}/vendors${fileNameHash}.js`),
    /* new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        "window.Zepto":"jquery"
    }),*/
    ...Set.htmlDeclare
];

if (IsProduction) {
    //console.log('目前编译生产环境');
    plugins.push(
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    );
    if (!IsTest) {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    screw_ie8: false
                },
                mangle: { screw_ie8: false },
                output: { screw_ie8: false }
            })
        );
    }
    CSS_Module_Loader_Pargram = "?modules&importLoaders=1&localIdentName=[hash:6]";
    CSS_SourceMap = "";
    imgCompress = "!image-webpack-loader";
    if (IsTest) {
        publicPath = "..";
    } else {
        publicPath = `https://${IsPre ? "pre" : "images"}.okpapa.com/activity/${Set.module}`; //cdn地址直接把www改为images就行
    }
} else {
    //console.log('目前编译开发环境');
    plugins.push(
        //live reload
        new LiveReloadPlugin({
            port: 35729,
            appendScriptTag: true,
            ignore: null
        })
    );
    CSS_Module_Loader_Pargram = "?modules&importLoaders=1&localIdentName=[path]__[name]__[local]__[hash:3]";
    CSS_SourceMap = "?sourceMap";
    imgCompress = "";
    publicPath = "..";
}

let configWrap = {
    entry: Object.assign({}, Set.entry),
    output: {
        path: path.resolve(__dirname, path.join("../", Set.outputDir, Set.module)),
        filename: `[name]/bundle${fileNameHash}.js`,
        publicPath,
        chunkFilename: "[name].chunk.min.js"
    },
    resolve: {
        root: path.resolve("./src"),
        alias: {
            common: "modules/tools/common",
            cssReset: "static/css/reset.css"
        },
        extensions: ["", ".js", ".jsx"]
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    "style" + CSS_SourceMap,
                    "css!postcss!resolve-url!sass"
                ) /*ExtractTextPlugin.extract(
             'style?sourceMap',
             'css&importLoaders=1',// + CSS_Module_Loader_Pargram +
             '!postcss' +
             '!resolve-url' +
             '!sass?sourceMap'
             )*/
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style", "css!postcss")
            },
            {
                test: /\.png|gif$/,
                exclude: /http/,
                loader: "url-loader?limit=4000&name=" + "/img/[name]_[hash:5].[ext]" + imgCompress
            },
            {
                test: /\.jpe?g|svg$/,
                exclude: /http/,
                loader: "file-loader?&name=" + "/img/[name]_[hash:5].[ext]" + imgCompress
            },
            { test: /\.handlebars$/, loader: "handlebars-loader" },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel", // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel", // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.tmpl$/,
                loader: "html-loader",
                query: {
                    minimize: true
                }
            },
            //为了解决html修改后不会自动reload的问题
            {
                test: /index.html/,
                loader: "html-loader",
                query: {
                    minimize: false
                }
            }
        ]
    },
    plugins: plugins,
    htmlLoader: {
        ignoreCustomFragments: [/\{\{.*?}}/],
        root: path.resolve(__dirname, "../src"),
        attrs: ["img:src", "img:data-src", "link:href"]
    },
    postcss: function() {
        return [autoprefixer];
    },
    imageWebpackLoader: {
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
                },
                {
                    removeEmptyAttrs: false
                }
            ]
        }
    }
};
if (process.env.NODE_ENV !== "production") {
    configWrap.devtool = "#inline-source-map";
} else if (IsTest) {
    configWrap.devtool = "eval";
}

module.exports = configWrap;
