export const APP_SCRIPT = `
document.addEventListener("submit", function (event) {
  var form = event.target;
  if (form.dataset.confirm && !window.confirm(form.dataset.confirm)) {
    event.preventDefault();
    return;
  }
  var button = event.submitter || form.querySelector('button[type="submit"], .btn');
  if (!button || !button.classList) return;
  setTimeout(function () {
    button.classList.add("loading");
    button.setAttribute("aria-busy", "true");
    button.disabled = true;
  }, 0);
});
document.addEventListener("input", function (event) {
  var input = event.target;
  if (!input.matches || !input.matches("[data-filter-cards]")) return;
  var query = input.value.toLowerCase().trim();
  document.querySelectorAll("[data-filter-text]").forEach(function (card) {
    var haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
    card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
  });
});
window.addEventListener("pageshow", function (event) {
  if (!event.persisted) return;
  document.querySelectorAll(".btn.loading").forEach(function (button) {
    button.classList.remove("loading");
    button.removeAttribute("aria-busy");
    button.disabled = false;
  });
});
`;
