const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HappyPack = require('happypack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const BundleTracker = require('webpack-bundle-tracker');
const happyThreadPool = HappyPack.ThreadPool({ size: 6 });
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const randomWords = require('random-words');

const fmr_root = 'FIldemRevamed@Grzegorz.ie';

module.exports = {
    mode: 'production',
    entry: {
        extension: './gnome-src/index.ts',
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
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, './gnome-src'),
        },
    },
    externals: {
        'gnome': 'global',
        'lang': 'imports.lang',
        'gi/meta': 'imports.gi.Meta',
        'gi/shell': 'imports.gi.Shell',
        'ui/main': 'imports.ui.main',
        'ui/popupMenu': 'imports.ui.popupMenu',
        'ui/panelMenu': 'imports.ui.panelMenu',
        'gi/atk': 'imports.gi.Atk',
        'gi/st': 'imports.gi.St',
        'gi/gtk': 'imports.gi.Gtk',
        'gi/gdk': 'imports.gi.Gdk',
        'gi/gobject': 'imports.gi.GObject',
        'gi/gio': 'imports.gi.Gio',
        'gi/soup': 'imports.gi.Soup',
        'gi/glib': 'imports.gi.GLib',
        'gi/clutter': 'imports.gi.Clutter',
        'misc/config': 'imports.misc.config',
        'me': 'imports.misc.extensionUtils.getCurrentExtension()'
    },
    optimization: {
        minimizer: [new TerserPlugin({
            parallel: true,
            terserOptions: {
            compress: {
                defaults: true,
            },
            mangle: true,
        }})],
        // splitChunks: {
        //     chunks: 'all',
        //     minSize: 0,
        //     maxAsyncRequests: Infinity,
        //     maxInitialRequests: Infinity,
        //     cacheGroups: {
        //         vendor: {
        //             test: /[\\/]node_modules[\\/]/,
        //             name(module) {
        //                 const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
        //                 return `npm.${packageName.replace('@', '')}`;
        //             },
        //             chunks: 'all',
        //             enforce: true,
        //         },
        //     },
        // },
        // runtimeChunk: true,
        removeAvailableModules: false,
        removeEmptyChunks: false,
    },
    plugins: [
        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            loaders: ['babel-loader?cacheDirectory=true'],
        }),
        // new BundleAnalyzerPlugin(),
        new BundleTracker({filename: path.resolve(__dirname, fmr_root, './dist/webpack-stats.json')}),
        new CleanWebpackPlugin(),
    ],
    target: 'web',
    output: {
        // filename: ({ chunk: { name } }) => {
        //     // -- Generate the random string
        //     const randomString = randomWords({ 
        //         exactly: 3, 
        //         minLength: 4,
        //         join: '-',
        //         seed: name
        //     });

        //     // -- Return the filename
        //     return `${name}-${randomString}.js`;
        // },
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        path: path.resolve(__dirname, fmr_root, './dist'),
    },
    devtool: 'source-map'
};