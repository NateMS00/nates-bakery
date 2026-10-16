/**
 * Whether the app is running installed on the Home Screen (SKELETON FLOW-05,
 * BONES-shell 1.7.0): iOS reports this so one build serves both the installed
 * tab bar and Safari's top-bar navigation. Browser-only — call after mount.
 */
export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
