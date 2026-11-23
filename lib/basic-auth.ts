/**
 * Optional HTTP Basic authentication in front of the whole site (review / pre-launch).
 * On when both BASIC_AUTH_USER and BASIC_AUTH_PASSWORD are set, off otherwise. Enforced in proxy.ts.
 */

export function isBasicAuthEnabled(): boolean {
  return Boolean(process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD);
}

/** Compares without stopping at the first difference, so the response time does not reveal how much matched. */
function sameText(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function isAuthorized(header: string | null): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)));
  } catch {
    return false;
  }
  const split = decoded.indexOf(":");
  if (split < 0) return false;
  // Both halves are always compared, whichever one is wrong.
  const userOk = sameText(decoded.slice(0, split), process.env.BASIC_AUTH_USER ?? "");
  const passwordOk = sameText(decoded.slice(split + 1), process.env.BASIC_AUTH_PASSWORD ?? "");
  return userOk && passwordOk;
}

/** Returns the 401 response to send, or null when the request may continue. */
export function basicAuthChallenge(req: Request): Response | null {
  if (!isBasicAuthEnabled() || isAuthorized(req.headers.get("authorization"))) return null;
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="webner", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}
