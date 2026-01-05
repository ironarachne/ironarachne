import type UserData from '$lib/user_data';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    interface PageData {
      user: UserData;
    }
    // interface Platform {}
  }
}

export {};
