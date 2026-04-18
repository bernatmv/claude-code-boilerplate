# @repo/config-typescript

Shared TypeScript base configuration for all workspace packages.

## Usage

In any package, create `tsconfig.json`:

```json
{
  "extends": "@repo/config-typescript/base.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Future variants (planned in later phases):
- `nextjs.json` — Next.js-specific overrides (Phase 4)
- `react-native.json` — React Native / Expo overrides (Phase 5)
- `node.json` — Node.js package overrides (Phase 3)
