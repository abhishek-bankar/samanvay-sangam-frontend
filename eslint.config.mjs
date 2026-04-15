import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src-tauri/**',
      '.vscode/**',
      '_bmad/**',
      '_bmad-output/**',
      '.claude/**',
      'docs/**',
      'coverage/**',
      'vite.config.ts',
    ],
  },
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      sonarjs: sonarjs,
      unicorn: unicorn,
      'react-hooks': reactHooks,
      '@typescript-eslint': tsPlugin,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // TypeScript
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // React Hooks
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',

      // Complexity
      'sonarjs/cognitive-complexity': ['error', 15],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-params': ['error', 7],

      // SonarJS Code Quality
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      // Unicorn — Modern JavaScript
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/error-message': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/better-regex': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',

      // Enforce @ imports — no relative imports
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: false,
          rootDir: 'src',
          prefix: '@',
        },
      ],

      // SANGAM-specific: Prevent direct fetch to Frappe API
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="fetch"][arguments.0.value*="/api/v2/"]',
          message:
            'Direct fetch() to Frappe API is forbidden. Use frappe-client.ts methods (frappe.getList, frappe.createDoc, etc.).',
        },
      ],

      // Prevent v1 API imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/frappe-client'],
              importNames: ['default'],
              message: 'Import named exports from frappe-client: { frappe }',
            },
          ],
        },
      ],
    },
  },
  {
    // Relax rules for test files
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // Allow direct fetch in frappe-client.ts (it IS the API boundary)
    files: ['src/lib/api/frappe-client.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Allow direct fetch in auth hooks (login endpoint is special)
    files: ['src/features/auth/**/*.ts', 'src/features/auth/**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
