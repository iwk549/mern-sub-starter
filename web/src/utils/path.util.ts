export function translatePath(path: string) {
  const basePath = path.split("?")[0].slice(1);
  switch (basePath) {
    default:
      return basePath.charAt(0).toUpperCase() + basePath.slice(1);
  }
}
