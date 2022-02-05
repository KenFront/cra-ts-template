module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen'],
      },
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    indentation: null,
    'selector-pseudo-element-no-unknown': null,
    'declaration-colon-newline-after': null,
    'value-list-comma-newline-after': null,
  },
};
