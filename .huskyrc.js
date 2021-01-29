module.exports = {
  hooks: {
    'pre-commit': 'NODE_ENV=production lint-staged',
    'pre-push': 'npm test',
  },
};
