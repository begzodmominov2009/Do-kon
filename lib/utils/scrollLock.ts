// Reference-counted body scroll lock, shared by every modal/sheet. Several
// can be mounted at once (e.g. a confirm dialog opened from inside a
// sheet), so a single "last one wins" boolean isn't enough — only releasing
// the lock once every lock has been released keeps scroll blocked exactly
// while at least one overlay is open, and never longer.
let lockCount = 0;

export function lockScroll(): void {
  if (lockCount === 0) {
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

export function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}
