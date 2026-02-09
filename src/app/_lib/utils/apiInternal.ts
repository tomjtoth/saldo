/**
 * Next.js obfuscates the error message thrown in server functions in production mode,
 * so will use this to catch errors, return as `HTTP 200 OK`,
 * then `callApi` on client-side unwraps the returned result or re-throws the error.
 *
 * @param apiFn the anonym wrapper that calls the previous function body
 * @returns an object with either result or error defined
 */
export async function apiInternal<T>(
  apiFn: () => Promise<T>
): Promise<{ result?: T; error?: string }> {
  try {
    const result = await apiFn();
    return { result };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
