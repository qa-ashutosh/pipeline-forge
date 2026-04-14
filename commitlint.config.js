/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type-enum: all valid commit types for pipeline-forge
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation only
        'style', // formatting, whitespace (no logic change)
        'refactor', // code change that is neither fix nor feature
        'perf', // performance improvement
        'test', // adding or updating tests
        'build', // changes to build system or dependencies
        'ci', // changes to CI/CD configuration
        'chore', // maintenance tasks
        'revert', // revert a previous commit
      ],
    ],
    // scope-enum: valid scopes map to services and cross-cutting concerns
    'scope-enum': [
      1, // warn only — don't block if scope is not in this list
      'always',
      ['users-api', 'orders-api', 'ci', 'docker', 'docs', 'deps', 'release', 'root'],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [0],
  },
};

export default config;
