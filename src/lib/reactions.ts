import { reactionKey } from "@/data/content";

const ENDPOINT = "https://api.web3forms.com/submit";

const STORE_KEY = "qma:loved";

export function hasLoved(): boolean {
  try {
    return localStorage.getItem(STORE_KEY) !== null;
  } catch {
    // Private mode and blocked storage both throw; treat as a fresh visitor.
    return false;
  }
}

export function rememberLove(): void {
  try {
    localStorage.setItem(STORE_KEY, new Date().toISOString());
  } catch {
    /* nothing to remember it with — the ping still went */
  }
}

/**
 * Send the ping. Resolves either way: a visitor who taps a heart should never
 * be shown an error, and there is nothing for them to retry.
 */
export async function sendLove(note?: string): Promise<boolean> {
  if (!reactionKey) return false;

  const body = {
    access_key: reactionKey,
    subject: note
      ? "Someone loved your portfolio — with a note"
      : "Someone loved your portfolio",
    from_name: "qazimaazarshad.github.io",
    // Web3Forms drops the submission if this is filled, which only a bot does.
    botcheck: "",
    message: note?.trim() || "No note left.",
    arrived_from: document.referrer || "direct",
    screen: `${window.innerWidth}x${window.innerHeight}`,
    at: new Date().toString(),
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}
