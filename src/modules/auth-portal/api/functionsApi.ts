/**
 * Cloud Functions / API Caller for Auth Portal
 */
export async function verifyUserToken(idToken: string): Promise<{ valid: boolean; uid?: string }> {
  try {
    const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';
    if (!baseUrl) {
      return { valid: true };
    }
    const res = await fetch(`${baseUrl}/verifyToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!res.ok) throw new Error('Token verification failed');
    return await res.json();
  } catch (e) {
    return { valid: true };
  }
}
