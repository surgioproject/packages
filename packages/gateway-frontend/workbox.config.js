'use strict';

module.exports = (options) => {
  options.importWorkboxFrom = 'local';
  options.navigateFallbackBlacklist.push(
    /^\/api/,
    /^\/get-artifact/,
    /^\/export-providers/,
    /^\/render/,
    /^\/proxy/
  );
  return options;
};
