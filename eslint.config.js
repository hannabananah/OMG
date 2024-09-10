import js from '@eslint/js';
import eslintImport from 'eslint-plugin-import';
import eslintReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended', // react-hooks 권장 규칙을 확장 (eslint-plugin-react-hooks)
      'plugin:react/recommended', // react 권장 규칙을 확장 (eslint-plugin-react)
      'plugin:prettier/recommended', // prettier 통합: eslint-config-prettier를 사용하여 충돌 방지
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024, // 최신 ECMAScript 버전 설정
      globals: globals.browser,
      parser: '@typescript-eslint/parser', // TypeScript 전용 파서 설정
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // .tsx 파일에서 JSX 구문 지원
        },
        sourceType: 'module', // ECMAScript 모듈 사용
        project: './tsconfig.json', // tsconfig.json 파일 설정 인식
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react: eslintReact,
      import: eslintImport,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // 1. React 관련
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off', // React 17 이후 JSX 사용 시 React import 불필요
      'react/jsx-uses-react': 'off', // React 17 이상에서는 필요 없으므로 비활성화
      'react/jsx-uses-vars': 'warn', // 선언된 변수가 JSX에서 사용되었는지 확인
      'react/prop-types': 'error', // props 타입 검사 활성화

      // 2. Hooks 관련 규칙
      'react-hooks/rules-of-hooks': 'error', // Hooks는 React 함수 컴포넌트 내에서만 호출
      'react-hooks/exhaustive-deps': 'warn', // React Hook의 의존성 배열 관리

      // 3. import 규칙
      ...eslintImport.configs.errors.rules,
      ...eslintImport.configs.warnings.rules,
      'import/named': 'error', // 존재하지 않는 것들 import 시 오류
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-unresolved': 'error', // 존재하지 않는 파일 import 시 오류
      'import/no-deprecated': 'warn', // 오래된 모듈 경고
      'import/no-duplicates': 'warn', // 같은 모듈 2번 이상 import 경고
      'import/first': 'warn', // import는 최상단 경고
      'import/no-unused-modules': [
        'warn',
        {
          unusedExports: true, // 사용되지 않는 모듈 경고
          missingExports: true, // 누락된 모듈 경고
          src: ['src/**/*.{ts,tsx,js,jsx}'], // 적용할 경로 설정
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['default'],
              message:
                'React 훅과 같은 기능은 named import 형태로 가져와야 합니다.',
            },
            {
              name: 'zustand',
              importNames: ['default'],
              message: 'zustand 스토어는 named import 형태로 가져와야 합니다.',
            },
          ],
        },
      ],

      // 4. 변수 처리
      'no-use-before-define': 'off', // 기본 ESLint 규칙 비활성화 (javascript 기반)
      '@typescript-eslint/no-use-before-define': ['error'], // TypeScript에서 변수를 정의하기 전에 사용하면 오류
      'no-unused-vars': 'off', // 기본 ESLint 규칙 비활성화 (javascript 기반)
      '@typescript-eslint/no-unused-vars': [
        // TypeScript 파일 내에서 사용되지 않는 변수에 대해 경고
        'warn',
        { args: 'all', ignoreRestSiblings: true },
      ],
      'no-shadow': 'off', // 기본 ESLint 규칙 비활성화 (javascript 기반)
      '@typescript-eslint/no-shadow': ['warn'], // TypeScript에서 변수 섀도잉(내부 변수의 이름이 상위 범위의 변수와 겹치는 것)을 방지

      // 5. 컨벤션 및 기타
      eqeqeq: 'warn', // 엄격한 일치 연산자 사용 (===와 !==를 사용)
      curly: 'warn', // 모든 제어 구문에 중괄호 사용
      'arrow-parens': ['warn', 'always'], // 매개변수에 괄호 필수
      camelcase: 'warn', // 네이밍 컨벤션: 변수명, 함수명
      'no-console': 'warn', // console 사용 시 경고
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전을 자동으로 감지
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // tsconfig.json 파일에서 설정한 path 사용하도록 ESLint에 알림
        },
      },
    },
  },
);
