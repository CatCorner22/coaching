export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const attempts = [];
    if (specifier.startsWith("@/")) {
      const mapped = new URL("../src/" + specifier.slice(2), import.meta.url).href;
      attempts.push(mapped, mapped + ".ts", mapped + ".tsx", mapped + "/index.ts");
    } else if (specifier.startsWith(".")) {
      attempts.push(specifier + ".ts", specifier + ".tsx", specifier + "/index.ts");
    }
    for (const a of attempts) {
      try {
        return await nextResolve(a, context);
      } catch {
        /* try next */
      }
    }
    throw err;
  }
}
