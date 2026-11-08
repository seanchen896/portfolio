export const contentUpdateKey = "portfolio-content-updated";
export const contentUpdateEvent = "portfolio:content-saved";

export function notifyContentSaved() {
  const revision = `${Date.now()}-${Math.random()}`;
  try { localStorage.setItem(contentUpdateKey, revision); } catch {}
  window.dispatchEvent(new Event(contentUpdateEvent));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(contentUpdateKey);
    channel.postMessage(revision); channel.close();
  }
}
