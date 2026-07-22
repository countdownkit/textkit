/*
 * Shared fancy-text logic — used by BOTH generate.js (Node, server render) and
 * tool.js (browser, re-render on input) so server + client output match exactly.
 * UMD-ish: attaches to module.exports under Node, window.FONTS in the browser.
 *
 * Each style maps ASCII letters/digits to Unicode variants (or applies a
 * transform). Maps are built from code-point ranges, with explicit overrides
 * for the reserved "holes" (e.g. italic h, double-struck C/H/N/P/Q/R/Z).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FONTS = factory();
})(typeof self !== "undefined" ? self : this, function () {

  // Build an A-Z / a-z / 0-9 map from starting code points (null = skip that band).
  function ranges(upper, lower, digit) {
    const map = {};
    for (let i = 0; i < 26; i++) {
      if (upper != null) map[String.fromCharCode(65 + i)] = String.fromCodePoint(upper + i);
      if (lower != null) map[String.fromCharCode(97 + i)] = String.fromCodePoint(lower + i);
    }
    if (digit != null) for (let i = 0; i < 10; i++) map[String.fromCharCode(48 + i)] = String.fromCodePoint(digit + i);
    return map;
  }
  function override(map, obj) { for (const k in obj) map[k] = obj[k]; return map; }
  // Copy uppercase glyphs onto lowercase keys (styles with no lowercase variants).
  function lowerFromUpper(map) {
    for (let i = 0; i < 26; i++) {
      const U = String.fromCharCode(65 + i), L = String.fromCharCode(97 + i);
      if (map[U] != null) map[L] = map[U];
    }
    return map;
  }
  // Copy lowercase glyphs onto uppercase keys (small caps etc.).
  function upperFromLower(map) {
    for (let i = 0; i < 26; i++) {
      const L = String.fromCharCode(97 + i), U = String.fromCharCode(65 + i);
      if (map[L] != null) map[U] = map[L];
    }
    return map;
  }

  // ---- character maps ----------------------------------------------------
  const BOLD        = ranges(0x1D400, 0x1D41A, 0x1D7CE);
  const ITALIC      = override(ranges(0x1D434, 0x1D44E, null), { h: "ℎ" }); // 𝘩 reserved -> ℎ
  const BOLDITALIC  = ranges(0x1D468, 0x1D482, null);
  const SCRIPT      = ranges(0x1D4D0, 0x1D4EA, null); // mathematical BOLD script (no reserved holes)
  const DOUBLE      = override(ranges(0x1D538, 0x1D552, 0x1D7D8),
    { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" });
  const SANSBOLD    = ranges(0x1D5D4, 0x1D5EE, 0x1D7EC);
  const MONO        = ranges(0x1D670, 0x1D68A, 0x1D7F6);
  const FULLWIDTH   = ranges(0xFF21, 0xFF41, 0xFF10);
  const BUBBLE      = override(ranges(0x24B6, 0x24D0, null),
    { "0": "⓪", "1": "①", "2": "②", "3": "③", "4": "④",
      "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨" });
  const FILLED      = override(lowerFromUpper(ranges(0x1F150, null, null)),
    { "0": "⓿", "1": "❶", "2": "❷", "3": "❸", "4": "❹",
      "5": "❺", "6": "❻", "7": "❼", "8": "❽", "9": "❾" });
  const SQUARED     = lowerFromUpper(ranges(0x1F170, null, null)); // negative squared 🅰

  const SMALLCAPS = upperFromLower({
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ",
    g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ",
    m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ꞯ", r: "ʀ",
    s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
    y: "ʏ", z: "ᴢ"
  });

  const SUPER = {
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ",
    g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ",
    m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "q", r: "ʳ",
    s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ",
    y: "ʸ", z: "ᶻ",
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾"
  };
  upperFromLower(SUPER);

  const SUB = {
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ",
    l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ",
    s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎"
  };
  upperFromLower(SUB);

  // Upside-down: flip each glyph, then reverse the whole string.
  const FLIP = {
    a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ",
    h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u",
    o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ",
    w: "ʍ", x: "x", y: "ʎ", z: "z",
    A: "∀", B: "ᗺ", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ",
    G: "⅁", H: "H", I: "I", J: "ſ", K: "ʞ", L: "˥", M: "W",
    N: "N", O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "⊥",
    U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
    "0": "0", "1": "Ɩ", "2": "ᄃ", "3": "Ɛ", "4": "ㄣ",
    "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6",
    ".": "˙", ",": "'", "'": ",", "\"": "„", "?": "¿", "!": "¡",
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<",
    "&": "⅋", "_": "‾", ";": "؛"
  };

  // ---- transforms --------------------------------------------------------
  function mapper(map) {
    return function (s) {
      let out = "";
      for (const ch of s) out += (map[ch] != null ? map[ch] : ch);
      return out;
    };
  }
  function combining(mark) {
    return function (s) {
      let out = "";
      for (const ch of s) out += ch + mark;
      return out;
    };
  }
  function upsideDown(s) {
    const out = [];
    for (const ch of s) out.push(FLIP[ch] != null ? FLIP[ch] : ch);
    return out.reverse().join("");
  }
  function reverse(s) { return Array.from(s).reverse().join(""); }
  function spaced(s) { return Array.from(s).join(" "); }
  function titleCase(s) { return s.toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()); }
  function sentenceCase(s) {
    return s.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, m => m.toUpperCase());
  }
  function alternating(s) {
    let n = 0, out = "";
    for (const ch of s) {
      if (/[a-z]/i.test(ch)) { out += n % 2 ? ch.toUpperCase() : ch.toLowerCase(); n++; }
      else out += ch;
    }
    return out;
  }

  // ---- the style registry (render order = order shown on a page) ---------
  const STYLES = [
    { id: "bold",          name: "Bold",           fn: mapper(BOLD) },
    { id: "italic",        name: "Italic",         fn: mapper(ITALIC) },
    { id: "bolditalic",    name: "Bold Italic",    fn: mapper(BOLDITALIC) },
    { id: "script",        name: "Cursive Script", fn: mapper(SCRIPT) },
    { id: "doublestruck",  name: "Double-Struck",  fn: mapper(DOUBLE) },
    { id: "sansbold",      name: "Sans Bold",      fn: mapper(SANSBOLD) },
    { id: "monospace",     name: "Monospace",      fn: mapper(MONO) },
    { id: "fullwidth",     name: "Wide (Fullwidth)", fn: mapper(FULLWIDTH) },
    { id: "bubble",        name: "Bubble",         fn: mapper(BUBBLE) },
    { id: "filledbubble",  name: "Filled Bubble",  fn: mapper(FILLED) },
    { id: "squared",       name: "Squared",        fn: mapper(SQUARED) },
    { id: "smallcaps",     name: "Small Caps",     fn: mapper(SMALLCAPS) },
    { id: "superscript",   name: "Superscript",    fn: mapper(SUPER) },
    { id: "subscript",     name: "Subscript",      fn: mapper(SUB) },
    { id: "strikethrough", name: "Strikethrough",  fn: combining("̶") },
    { id: "underline",     name: "Underline",      fn: combining("̲") },
    { id: "upsidedown",    name: "Upside Down",    fn: upsideDown },
    { id: "reverse",       name: "Reversed",       fn: reverse },
    { id: "spaced",        name: "Spaced Out",     fn: spaced },
    { id: "upper",         name: "UPPERCASE",      fn: s => s.toUpperCase() },
    { id: "lower",         name: "lowercase",      fn: s => s.toLowerCase() },
    { id: "title",         name: "Title Case",     fn: titleCase },
    { id: "sentence",      name: "Sentence case",  fn: sentenceCase },
    { id: "alternating",   name: "aLtErNaTiNg",    fn: alternating }
  ];

  function apply(id, text) {
    const st = STYLES.find(s => s.id === id);
    return st ? st.fn(text) : text;
  }

  return { STYLES, apply };
});
