export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toPrecision(3)} KB`
  }
  return `${(bytes / 1024 / 1024).toPrecision(3)} MB`
}
