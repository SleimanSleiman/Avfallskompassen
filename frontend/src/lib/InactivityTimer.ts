import { logout } from "./Auth";
import { setInactivityLogout } from "./TimerLogoutReason";

let inactivityTimeout: ReturnType<typeof setTimeout> | null = null;

const INACTIVITY_LIMIT = 10 * 60 * 1000;
const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

function resetTimer() {
  if (inactivityTimeout) clearTimeout(inactivityTimeout);

  inactivityTimeout = setTimeout(() => {
    setInactivityLogout(true);
    logout();
    window.location.href = "/login";
  }, INACTIVITY_LIMIT);
}

export function startInactivityTimer() {
  resetTimer();

  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });
}

export function stopInactivityTimer() {
  if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = null;
    }
    events.forEach(event =>
      window.removeEventListener(event, resetTimer)
    );
}
