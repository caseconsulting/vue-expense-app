module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  parallel: false,
  devServer: {
    client: {
      overlay: true
    }
  }
};
