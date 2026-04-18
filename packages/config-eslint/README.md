# @repo/config-eslint

Shared flat ESLint config for all workspace packages.

## Usage

In any package, create `eslint.config.js`:

```js
import base from "@repo/config-eslint";

export default [
  ...base,
  {
    // package-specific overrides
  },
];
```

In TypeScript projects, ensure a `tsconfig.json` exists (used by `projectService`).
Files outside any project (root scripts, fixtures) are linted via the typescript-eslint default-project escape hatch (`allowDefaultProject` patterns).

Future overlays (planned in later phases):

- React + Next.js rules (Phase 4)
- React Native rules (Phase 5)
- jsx-a11y (Phase 9)
