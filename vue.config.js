module.exports = {
  devServer: {
    https: false,
    port: 8082
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
  pluginOptions: {}
};
