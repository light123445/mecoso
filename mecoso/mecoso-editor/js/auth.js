/* ===========================================================
   MECOSO EDITOR — access gate
   NOTE: This is a client-side convenience gate only (a static
   site has no server to truly protect). Do not rely on this to
   protect sensitive data — anyone who views the page source can
   see the credentials. For real security this would need a
   backend with proper authentication.
=========================================================== */

const EDITOR_USERNAME = "mimi";
const EDITOR_PASSWORD = "4321";
const AUTH_KEY = "mecoso_editor_auth";

function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}
function logIn(username, password) {
  if (username === EDITOR_USERNAME && password === EDITOR_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}
function logOut() {
  sessionStorage.removeItem(AUTH_KEY);
}
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}
