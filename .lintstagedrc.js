module.exports = {
  '*.{ts,tsx}': (files) => 'eslint --max-warnings=0 ' + files.join(' '),
};
