// Fancy-text controls: the rows are server-rendered for SEO; this re-renders
// each row's output (via the shared FONTS module) whenever the user types, so
// client output matches the server. Copy buttons use the async Clipboard API
// with an execCommand fallback for older/insecure contexts.
(function () {
  const tool = document.querySelector("[data-tool]");
  if (!tool || !window.FONTS) return;
  const src = tool.querySelector("[data-src]");
  const rows = Array.prototype.slice.call(tool.querySelectorAll(".frow"));

  function render() {
    const text = src.value;
    for (const row of rows) {
      const out = row.querySelector("[data-out]");
      if (out) out.textContent = FONTS.apply(row.dataset.style, text);
    }
  }
  src.addEventListener("input", render);

  const clear = tool.querySelector("[data-clear]");
  if (clear) clear.addEventListener("click", function () {
    src.value = "";
    render();
    src.focus();
  });

  // one delegated handler for every Copy button
  tool.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const out = btn.parentElement.querySelector("[data-out]");
    if (out) copy(out.textContent, btn);
  });

  function flash(btn) {
    const original = btn.getAttribute("data-label") || "Copy";
    btn.setAttribute("data-label", original);
    btn.textContent = "Copied!";
    btn.classList.add("ok");
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove("ok");
    }, 1200);
  }
  function copy(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(btn); }, function () { fallback(text, btn); });
    } else {
      fallback(text, btn);
    }
  }
  function fallback(text, btn) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    flash(btn);
  }

  // sync once in case the browser restored a previous input value
  render();
})();
