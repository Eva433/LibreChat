export const isDemoMode = () =>
  typeof globalThis !== 'undefined' &&
  (globalThis as { __LIBRECHAT_DEMO_MODE__?: boolean }).__LIBRECHAT_DEMO_MODE__ === true;
