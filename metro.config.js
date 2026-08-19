// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Preserve component/function names through release minification so production
// crash stacks (e.g. "Maximum update depth exceeded ... at <Component>") name the
// real component instead of "anonymous". Small bundle-size cost, big debuggability win.
config.transformer.minifierConfig = {
  ...(config.transformer.minifierConfig || {}),
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    ...((config.transformer.minifierConfig && config.transformer.minifierConfig.mangle) || {}),
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
