/**
 * Extract IP address from request headers and connection info
 * Prioritizes x-real-ip header (set by Vercel) over socket IP
 * @throws Error if IP address cannot be determined
 */
export function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}): string {
  const xRealIp = req.headers['x-real-ip'];
  const headerIp =
    typeof xRealIp === 'string'
      ? xRealIp
      : Array.isArray(xRealIp)
        ? xRealIp[0]
        : undefined;

  const ip = headerIp || req.ip;

  if (!ip) {
    throw new Error('Unable to determine client IP address');
  }

  return ip;
}
