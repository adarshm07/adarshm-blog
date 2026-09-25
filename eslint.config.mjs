// eslint-config-next 16 ships flat configs directly, so no FlatCompat shim.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      /**
       * Downgraded to a warning, not switched off.
       *
       * Every current violation is the same shape: a client component reading
       * localStorage (progress, API key, draft) or measuring the DOM on mount,
       * which cannot happen during render because the server has no such state.
       * The rule is right that this causes a second render — the proper fix is
       * useSyncExternalStore with a cached snapshot, which the progress store is
       * already shaped for. That refactor is worth doing on its own, not as a
       * drive-by, so these stay visible as warnings until then.
       */
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
