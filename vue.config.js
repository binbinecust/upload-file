module.exports = {
  configureWebpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: { inline: true },
      },
    });
  },
  devServer: {
    https: false,
    // proxy: {
    //   '/api/*': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': '/'
    //     },
    //     secure: false,
    //     cookieDomainRewrite: 'localhost'
    //   }
    // }
  },
  pluginOptions: {},
};
