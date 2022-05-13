module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  devServer: {
    disableHostCheck: true
  },
  parallel: false
};
