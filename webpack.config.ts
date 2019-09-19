import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

export default (env: any, argv: any): webpack.Configuration => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  return {
    mode,
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'bundle.prod.js' : 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.ts'],
      modules: ['node_modules'],
    },
    devServer: {
      inline: true,
      hot: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, 'dist', isProd ? 'index.prod.html' : 'index.html')
      })
    ]
  }
};