const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HappyPack = require('happypack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const BundleTracker = require('webpack-bundle-tracker');
const happyThreadPool = HappyPack.ThreadPool({ size: 1 });
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const randomWords = require('random-words');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        extension: './client/extension.ts',
        prefs: './client/prefs.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'happypack/loader?id=babel',
                    },
                ],
            },
            {
                test: /\.ts$/,
                loader: 'string-replace-loader',
                options: {
                    // -- replace multiple non-indent spaces with a single space
                    search: / {2,}/g,
                    replace: ' ',
                },
            },
        ],
    },
    externals: {
        'gi': 'gi',       
        'system': 'system',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimization: {
        minimize: true, // -- Handy for debugging
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        defaults: false,
                    },
                    mangle: true,
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        ],
    },
    plugins: [

        // new webpack.IgnorePlugin({
        //     resourceRegExp: /^gi:/,
        // }),

        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            loaders: ['babel-loader?cacheDirectory=true'],
        }),
        // new BundleAnalyzerPlugin(),
        new BundleTracker({
            filename: './FildemRevamped@grzegorz.ie/dist/webpack-stats.json',
        }),
        new CleanWebpackPlugin(),
    ],
    target: 'web',
    output: {
        library: {
            name: 'lib',
            type: 'var',
        },
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        path: path.resolve(__dirname, './FildemRevamped@grzegorz.ie/dist')
    },
    devtool: 'source-map',
};
