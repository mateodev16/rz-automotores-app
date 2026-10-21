export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('config/db.js')) {
    return {
      url: new URL('./mock-db.mjs', import.meta.url).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
