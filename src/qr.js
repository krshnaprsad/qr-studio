/* QR Studio core. No browser needed, so it can be tested in Node.
   The QR maths comes from the qrcode-generator library in vendor/ (MIT). Everything else is here. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../vendor/qrcode.js"));
  else root.QRS = factory(root.qrcode);
})(typeof self !== "undefined" ? self : this, function (qrcode) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

  // Escape the characters that have a meaning inside Wi-Fi and vCard style text
  function esc(s) { return String(s).replace(/([\\;,":])/g, "\\$1"); }

  // What gets written into the code, for each kind of code
  function payload(kind, f) {
    f = f || {};
    if (kind === "wifi") {
      var sec = f.security === "none" ? "nopass" : f.security === "WEP" ? "WEP" : "WPA";
      return "WIFI:T:" + sec + ";S:" + esc(f.ssid || "") + ";" + (sec === "nopass" ? "" : "P:" + esc(f.password || "") + ";") + (f.hidden ? "H:true;" : "") + ";";
    }
    if (kind === "email") {
      var q = [];
      if (f.subject) q.push("subject=" + encodeURIComponent(f.subject));
      if (f.body) q.push("body=" + encodeURIComponent(f.body));
      return "mailto:" + (f.to || "") + (q.length ? "?" + q.join("&") : "");
    }
    if (kind === "phone") return "tel:" + String(f.number || "").replace(/[^\d+]/g, "");
    return String(f.text || "");
  }

  // Build the grid of dark and light squares. ecc is L, M, Q or H.
  function matrix(text, ecc) {
    var qr = qrcode(0, ecc || "M"); qr.addData(text, "Byte"); qr.make();
    var n = qr.getModuleCount(), m = [];
    for (var r = 0; r < n; r++) { m.push([]); for (var c = 0; c < n; c++) m[r].push(qr.isDark(r, c)); }
    return m;
  }

  function hex(c) { var m = /^#?([0-9a-f]{6})$/i.exec(c || ""); return m ? m[1] : null; }
  function lum(c) { var h = hex(c); if (!h) return 0; var v = [0, 2, 4].map(function (i) { var x = parseInt(h.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  function isInverted(o) { return lum(o.fg) > lum(o.bg); }

  // Plain language warnings about things that stop codes scanning
  function warnings(o, textLength) {
    var w = [];
    var cr = contrast(o.fg, o.bg);
    if (!o.transparent && cr < 3) w.push("The colours are too close (contrast " + cr.toFixed(1) + " to 1). Many phones will not scan this. Make the code darker or the background lighter.");
    else if (!o.transparent && cr < 4.5) w.push("Contrast is on the low side (" + cr.toFixed(1) + " to 1). It may scan on new phones and fail on older ones. Test it.");
    if (!o.transparent && lum(o.fg) > lum(o.bg)) w.push("Light code on a dark background is inverted. Many scanners misread or reject inverted codes, and my own tests with three decoders mostly failed on them. Use the Swap colours button to get a dark code on a light background.");
    if (o.margin !== undefined && +o.margin < 4) w.push("The border is thinner than the 4 squares scanners expect around a code. Pick Normal or Wide if it fails to scan.");
    if (o.logo && o.logoSize > 24) w.push("A big logo hides part of the code. Above about 24 percent it often stops scanning. Make it smaller if a phone struggles.");
    if (o.logo && o.ecc !== "H") w.push("With a logo the code needs the highest repair level (H). Switch it on.");
    if (FANCY[o.dots]) w.push("The " + SHAPE_NAMES[o.dots].toLowerCase() + " shape is decorative and harder for a phone to read than the plain ones. Scan it on your phone before you use it" + (textLength > 120 ? ", and shorten the text if it fails" : "") + ".");
    if (textLength > 600) w.push("That is a lot of text, so the code will be dense and hard to scan from far away. A short link works better.");
    return w;
  }

  // Draw one module (a small square of the code) in the chosen shape. x, y: top left, s: size.
  function sq(x, y, s, st) {
    var f = function (n) { return +(n * s).toFixed(3); }, X = function (n) { return +(x + n * s).toFixed(3); }, Y = function (n) { return +(y + n * s).toFixed(3); };
    var P = function (pts) { return "M" + pts.map(function (p) { return X(p[0]) + " " + Y(p[1]); }).join("L") + "z"; };
    switch (st) {
      case "dots": return "M" + X(0.5) + " " + y + "a" + f(0.5) + " " + f(0.5) + " 0 1 0 .001 0z";
      case "rounded": { var k = 0.3, w = 1 - 2 * k; return "M" + X(k) + " " + y + "h" + f(w) + "a" + f(k) + " " + f(k) + " 0 0 1 " + f(k) + " " + f(k) + "v" + f(w) + "a" + f(k) + " " + f(k) + " 0 0 1 -" + f(k) + " " + f(k) + "h-" + f(w) + "a" + f(k) + " " + f(k) + " 0 0 1 -" + f(k) + " -" + f(k) + "v-" + f(w) + "a" + f(k) + " " + f(k) + " 0 0 1 " + f(k) + " -" + f(k) + "z"; }
      case "diamond": return P([[0.5, -0.12], [1.12, 0.5], [0.5, 1.12], [-0.12, 0.5]]);
      case "vbars": return P([[0.12, 0], [0.88, 0], [0.88, 1], [0.12, 1]]);
      case "hbars": return P([[0, 0.12], [1, 0.12], [1, 0.88], [0, 0.88]]);
      case "small": return P([[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]]);
      case "plus": return P([[0.2, 0], [0.8, 0], [0.8, 0.2], [1, 0.2], [1, 0.8], [0.8, 0.8], [0.8, 1], [0.2, 1], [0.2, 0.8], [0, 0.8], [0, 0.2], [0.2, 0.2]]);
      case "star": { var pts = []; for (var i = 0; i < 10; i++) { var r = i % 2 ? 0.45 : 0.85, an = -Math.PI / 2 + i * Math.PI / 5; pts.push([0.5 + r * Math.cos(an), 0.52 + r * Math.sin(an)]); } return P(pts); }
      case "heart": return "M" + X(0.5) + " " + Y(1.02) + "C" + X(-0.2) + " " + Y(0.6) + " " + X(-0.08) + " " + Y(-0.02) + " " + X(0.28) + " " + Y(0.0) + "C" + X(0.42) + " " + Y(0.0) + " " + X(0.5) + " " + Y(0.12) + " " + X(0.5) + " " + Y(0.24) + "C" + X(0.5) + " " + Y(0.12) + " " + X(0.58) + " " + Y(0.0) + " " + X(0.72) + " " + Y(0.0) + "C" + X(1.08) + " " + Y(-0.02) + " " + X(1.2) + " " + Y(0.6) + " " + X(0.5) + " " + Y(1.02) + "z";
      case "leaf": return "M" + X(0.5) + " " + y + "H" + X(1) + "V" + Y(0.5) + "A" + f(0.5) + " " + f(0.5) + " 0 0 1 " + X(0.5) + " " + Y(1) + "H" + x + "V" + Y(0.5) + "A" + f(0.5) + " " + f(0.5) + " 0 0 1 " + X(0.5) + " " + y + "z";
    }
    return "M" + x + " " + y + "h" + s + "v" + s + "h-" + s + "z";
  }
  // The three big corner squares, drawn as a ring plus a centre
  function eye(x, y, st) {
    var ring, mid;
    if (st === "circle") {
      ring = rr(x, y, 7, 2.1) + rr(x + 1, y + 1, 5, 1.2); mid = rr(x + 2, y + 2, 3, 0.9);
    } else if (st === "leaf") {
      ring = lf(x, y, 7, 1.6) + lf(x + 1, y + 1, 5, 0.9); mid = lf(x + 2, y + 2, 3, 0.6);
    } else if (st === "cut") {
      ring = ct(x, y, 7, 0.7) + ct(x + 1, y + 1, 5, 0.4); mid = ct(x + 2, y + 2, 3, 0.3);
    } else if (st === "rounded") {
      var o = rr(x, y, 7, 1.8), i = rr(x + 1, y + 1, 5, 1.1);
      ring = o + i; mid = rr(x + 2, y + 2, 3, 0.8);
    } else {
      ring = "M" + x + " " + y + "h7v7h-7zM" + (x + 1) + " " + (y + 1) + "v5h5v-5z";
      mid = "M" + (x + 2) + " " + (y + 2) + "h3v3h-3z";
    }
    return { ring: ring, mid: mid };
  }
  function lf(x, y, s, k) { return "M" + (x + k) + " " + y + "H" + (x + s) + "V" + (y + s - k) + "A" + k + " " + k + " 0 0 1 " + (x + s - k) + " " + (y + s) + "H" + x + "V" + (y + k) + "A" + k + " " + k + " 0 0 1 " + (x + k) + " " + y + "z"; }
  function ct(x, y, s, k) { return "M" + (x + k) + " " + y + "H" + (x + s - k) + "L" + (x + s) + " " + (y + k) + "V" + (y + s - k) + "L" + (x + s - k) + " " + (y + s) + "H" + (x + k) + "L" + x + " " + (y + s - k) + "V" + (y + k) + "z"; }
  function rr(x, y, s, k) { var w = s - 2 * k; return "M" + (x + k) + " " + y + "h" + w + "a" + k + " " + k + " 0 0 1 " + k + " " + k + "v" + w + "a" + k + " " + k + " 0 0 1 -" + k + " " + k + "h-" + w + "a" + k + " " + k + " 0 0 1 -" + k + " -" + k + "v-" + w + "a" + k + " " + k + " 0 0 1 " + k + " -" + k + "z"; }

  // Shapes for the dots and the three big corners. FANCY ones scanned less reliably in my tests, see the README.
  var SHAPE_NAMES = { square: "Square", rounded: "Rounded", dots: "Round dots", leaf: "Leaf", vbars: "Vertical bars", hbars: "Horizontal bars", diamond: "Diamond", small: "Small squares", plus: "Plus", star: "Star", heart: "Heart" };
  var FANCY = { diamond: 1, hbars: 1, plus: 1, star: 1, heart: 1 };
  var EYE_NAMES = { square: "Square", rounded: "Rounded", circle: "Circle", leaf: "Leaf", cut: "Cut corners" };
  function shapePath(st) { return sq(0, 0, 1, st); }
  function eyePath(st) { var e = eye(0, 0, st); return e; }
  var DEF = { fg: "#000000", bg: "#ffffff", transparent: false, dots: "square", eyes: "square", eyeColor: "", margin: 4, ecc: "Q", logo: "", logoSize: 20 };

  // Make the SVG text. text: what to encode. o: options (see DEF).
  function svg(text, opts) {
    var o = {}; for (var k in DEF) o[k] = opts && opts[k] !== undefined ? opts[k] : DEF[k];
    if (o.logo && o.ecc !== "H") o.ecc = "H";
    var m = matrix(text, o.ecc), n = m.length, mg = Math.max(0, Math.min(10, +o.margin)), size = n + 2 * mg;
    // keep a clear square in the middle for the logo
    var clear = null;
    if (o.logo) { var side = Math.round(n * Math.min(30, Math.max(8, o.logoSize)) / 100); if ((n - side) % 2) side++; var s0 = (n - side) / 2; clear = { a: s0 - 0.5, b: s0 + side + 0.5, s0: s0, side: side }; }
    var inEye = function (r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); };
    var d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c] || inEye(r, c)) continue;
      if (clear && r >= clear.a && r < clear.b && c >= clear.a && c < clear.b) continue;
      d += sq(c + mg, r + mg, 1, o.dots);
    }
    var ec = o.eyeColor || o.fg, eyes = [[0, 0], [n - 7, 0], [0, n - 7]].map(function (p) { return eye(p[0] + mg, p[1] + mg, o.eyes); });
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="geometricPrecision">';
    if (!o.transparent) out += '<rect width="' + size + '" height="' + size + '" fill="' + o.bg + '"/>';
    out += '<path fill="' + o.fg + '" d="' + d + '"/>';
    out += '<path fill="' + ec + '" fill-rule="evenodd" d="' + eyes.map(function (e) { return e.ring; }).join("") + '"/>';
    out += '<path fill="' + ec + '" d="' + eyes.map(function (e) { return e.mid; }).join("") + '"/>';
    if (o.logo) out += '<image href="' + o.logo + '" x="' + (clear.s0 + mg) + '" y="' + (clear.s0 + mg) + '" width="' + clear.side + '" height="' + clear.side + '" preserveAspectRatio="xMidYMid meet"/>';
    return out + "</svg>";
  }

  return { SHAPE_NAMES: SHAPE_NAMES, EYE_NAMES: EYE_NAMES, FANCY: FANCY, shapePath: shapePath, eyePath: eyePath, payload: payload, matrix: matrix, svg: svg, contrast: contrast, isInverted: isInverted, warnings: warnings, DEF: DEF };
});
