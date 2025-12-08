import { logout } from "./Auth";

let inactivityTimeout: ReturnType<typeof setTimeout> | null = null;

const INACTIVITY_LIMIT = 10 * 60 * 1000;

function resetTimer() {
  if (inactivityTimeout) clearTimeout(inactivityTimeout);

  inactivityTimeout = setTimeout(() => {
    logout();
    window.location.href = "/login";
  }, INACTIVITY_LIMIT);
}

export function startInactivityTimer() {
  resetTimer();

  const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });
}

export function stopInactivityTimer() {
  if (inactivityTimeout) clearTimeout(inactivityTimeout);
}
