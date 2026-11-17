export async function signInWithApple(): Promise<never> {
  throw new Error('Apple authentication is only available on iOS.');
}
