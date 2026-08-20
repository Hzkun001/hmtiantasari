import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
            '@next/next/no-location-assign-relative-destination': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react/no-unescaped-entities': 'off',
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
