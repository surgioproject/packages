module.exports = {
  '*.{ts}': files =>
    'eslint --max-warnings=0 ' + files.join(' '),
};
