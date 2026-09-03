import standard from '@jobscale/eslint-plugin-standard';

export default [{
  ignores: [
    ...standard.configs.standard.ignores,
    '**/target/*/build/**',
  ],
}, {
  ...standard.configs.browser,
  name: 'browser rule',
  files: ['**/*.js'],
  rules: {
    ...standard.rules,
    'no-loop-func': 'off',
  },
}];
