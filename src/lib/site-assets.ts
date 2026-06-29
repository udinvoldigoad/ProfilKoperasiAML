export const SITE_ASSET_ROUTE_PREFIX = "/api/site-assets";

export function siteAssetUrl(relativePath: string) {
  const normalized = relativePath
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SITE_ASSET_ROUTE_PREFIX}/${normalized}`;
}

export function siteAssetRelativePath(segments: string[]) {
  if (segments.length === 0) return null;

  const safeSegments = segments.map((segment) => {
    const value = segment.trim();
    if (!value || value === "." || value === ".." || value.startsWith(".")) return null;
    if (value.includes("/") || value.includes("\\") || /[<>:"|?*\x00-\x1F]/.test(value)) return null;
    return value;
  });

  if (safeSegments.some((segment) => segment === null)) return null;
  return safeSegments.join("/");
}

export function siteAssetContentType(relativePath: string) {
  const extension = relativePath.split(".").pop()?.toLowerCase() ?? "";
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
