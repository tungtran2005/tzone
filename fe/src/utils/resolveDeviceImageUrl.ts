export function resolveDeviceImageUrl(imageUrl?: string): string {
  if (!imageUrl) return '';

  const minioBaseUrl = (import.meta.env.VITE_MINIO_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const minioBucket = (import.meta.env.VITE_MINIO_BUCKET || '').replace(/^\/+|\/+$/g, '');

  // Keep seeded remote URLs unchanged.
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // Support legacy backslash paths coming from Windows-built data.
  const normalizedPath = imageUrl.replace(/\\/g, '/');

  if (minioBaseUrl && minioBucket) {
    const relativePath = normalizedPath.replace(/^\/+/, '');
    if (relativePath.startsWith('media/') || relativePath.startsWith('devices/')) {
      return `${minioBaseUrl}/${minioBucket}/${relativePath}`;
    }
  }

  if (normalizedPath.startsWith('/')) {
    return normalizedPath;
  }

  return `/${normalizedPath}`;
}

