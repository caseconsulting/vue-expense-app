module.exports = {
  lintOnSave: import.meta.env.NODE_ENV !== 'production',
  parallel: false,
  devServer: {
    client: {
      overlay: true
    }
  }
};
