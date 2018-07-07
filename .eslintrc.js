module.exports = {
  extends: [
    'airbnb-base',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  },
  parser: 'babel-eslint',
  overrides: [
    {
      files: ['*.test.js'],
      env: {
        jest: true
      },
      globals: {
        document: false
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
};
