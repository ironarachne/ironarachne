const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  configureWebpack: config => {

    // get a reference to the existing ForkTsCheckerWebpackPlugin
    const existingForkTsChecker = config.plugins.filter(
      p => p instanceof ForkTsCheckerWebpackPlugin,
    )[0];

    // remove the existing ForkTsCheckerWebpackPlugin
    // so that we can replace it with our modified version
    config.plugins = config.plugins.filter(
      p => !(p instanceof ForkTsCheckerWebpackPlugin),
    );

    // copy the options from the original ForkTsCheckerWebpackPlugin
    // instance and add the memoryLimit property
    const forkTsCheckerOptions = existingForkTsChecker.options;
    forkTsCheckerOptions.memoryLimit = 16284;

    config.plugins.push(new ForkTsCheckerWebpackPlugin(forkTsCheckerOptions));
  },
};
