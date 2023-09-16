const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HappyPack = require('happypack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const BundleTracker = require('webpack-bundle-tracker');
const happyThreadPool = HappyPack.ThreadPool({ size: 6 });
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fmr_root = 'FildemRevamped@grzegorz.ie';

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
        new BundleTracker({filename: path.resolve(__dirname, fmr_root, './webpack-stats.json')}),
        new CleanWebpackPlugin()
    ],
    target: 'web',
    output: {
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        path: path.resolve(__dirname, fmr_root),
    },
    devtool: 'source-map'
};