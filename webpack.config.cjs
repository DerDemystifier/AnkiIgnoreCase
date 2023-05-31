// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';


const config = {
    entry: './src/ignoreCase.js',
    output: {
        filename: "ignoreCase.min.js",
        path: path.resolve(__dirname, 'docs'),
    },
    plugins: [
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        { source: 'docs/ignoreCase.min.js', destination: 'addon_files/_ignoreCase.min.js' }
                    ]
                }
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';


    } else {
        config.mode = 'development';
    }
    return config;
};
