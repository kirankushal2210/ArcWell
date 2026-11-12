// Side-effect CSS imports (NativeWind's global.css in the root layout). Expo declares these in its
// generated expo-env.d.ts, which is gitignored, so CI needs this tracked declaration to typecheck.
declare module "*.css";
