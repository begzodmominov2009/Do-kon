export type AppUser = {
  kind: "guest" | "telegram";
  name: string | null;
  username: string | null;
  photoUrl: string | null;
};

// Web-only for now: always returns a guest. Once this runs inside the
// Telegram Mini App, this will read window.Telegram.WebApp.initDataUnsafe.user
// and return a "telegram" user instead — call sites don't need to change.
export function useUser(): AppUser {
  return { kind: "guest", name: null, username: null, photoUrl: null };
}
