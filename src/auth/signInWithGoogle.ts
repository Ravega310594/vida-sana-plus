export async function signInWithGoogle(): Promise<never> {
  throw new Error('Google Sign-In is only available in native builds.');
}
