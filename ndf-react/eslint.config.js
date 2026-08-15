import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  // Ignore output dirs and wireframes prototype (separate package)
  { ignores: ['dist', 'node_modules', 'wireframes/'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/core/domain/**/*' },
        { type: 'application', pattern: 'src/core/application/**/*' },
        { type: 'ports', pattern: 'src/core/ports/**/*' },
        { type: 'infrastructure', pattern: 'src/core/infrastructure/**/*' },
        { type: 'ui', pattern: 'src/ui/**/*' },
      ],
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'domain',
              disallow: ['application', 'ports', 'infrastructure', 'ui'],
              message: '[domain] Domain layer must not depend on any other layer.',
            },
            {
              from: 'application',
              disallow: ['infrastructure', 'ui'],
              message: '[application] Application layer must not depend on infrastructure or ui.',
            },
            {
              from: 'ports',
              disallow: ['application', 'infrastructure', 'ui'],
              message: '[ports] Ports must not depend on application, infrastructure or ui.',
            },
            {
              from: 'infrastructure',
              disallow: ['ui'],
              message: '[infrastructure] Infrastructure must not depend on ui.',
            },
          ],
        },
      ],
    },
  },

  // Domain layer: must not import any framework or adapter package
  {
    files: ['src/core/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: '[domain] Must not import React.',
            },
            {
              name: 'react-dom',
              message: '[domain] Must not import React DOM.',
            },
            {
              name: 'react-router-dom',
              message: '[domain] Must not import React Router.',
            },
            {
              name: 'dexie',
              message: '[domain] Must not import Dexie.',
            },
            {
              name: 'zod',
              message: '[domain] Must not import Zod.',
            },
          ],
          patterns: [
            {
              group: ['@tiptap/*'],
              message: '[domain] Must not import Tiptap.',
            },
            {
              group: ['dexie-*'],
              message: '[domain] Must not import Dexie plugins.',
            },
            {
              group: ['@/core/infrastructure/*', '**/infrastructure/*'],
              message: '[domain] Must not import from infrastructure layer.',
            },
            {
              group: ['@/ui/*', '**/ui/*'],
              message: '[domain] Must not import from ui layer.',
            },
            {
              group: ['@/core/application/*', '**/application/*'],
              message: '[domain] Must not import from application layer.',
            },
            {
              group: ['@/core/ports/*', '**/ports/*'],
              message: '[domain] Must not import from ports.',
            },
          ],
        },
      ],
    },
  },

  // Application layer: must not import infrastructure or ui
  {
    files: ['src/core/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: '[application] Must not import React.',
            },
            {
              name: 'react-dom',
              message: '[application] Must not import React DOM.',
            },
            {
              name: 'react-router-dom',
              message: '[application] Must not import React Router.',
            },
            {
              name: 'dexie',
              message: '[application] Must not import Dexie.',
            },
            {
              name: 'zod',
              message: '[application] Must not import Zod.',
            },
          ],
          patterns: [
            {
              group: ['@tiptap/*'],
              message: '[application] Must not import Tiptap.',
            },
            {
              group: ['dexie-*'],
              message: '[application] Must not import Dexie plugins.',
            },
            {
              group: ['@/core/infrastructure/*', '**/infrastructure/*'],
              message: '[application] Must not import from infrastructure directly. Use ports.',
            },
            {
              group: ['@/ui/*', '**/ui/*'],
              message: '[application] Must not import from ui.',
            },
          ],
        },
      ],
    },
  },
);
