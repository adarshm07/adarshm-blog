import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  globalIgnores(['node_modules/**', '.next/**', 'out/**']),
  ...nextCoreWebVitals,
  ...nextTypescript,
])
