const assert = require("assert"), Q = require("../src/qr.js");
// what goes into the code
assert.strictEqual(Q.payload("url", { text: "https://a.com" }), "https://a.com");
assert.strictEqual(Q.payload("wifi", { ssid: "Home", password: "pass", security: "WPA" }), "WIFI:T:WPA;S:Home;P:pass;;");
assert.strictEqual(Q.payload("wifi", { ssid: "My;Net", password: "p:w", security: "WPA", hidden: true }), "WIFI:T:WPA;S:My\\;Net;P:p\\:w;H:true;;");
assert.strictEqual(Q.payload("wifi", { ssid: "Open", security: "none" }), "WIFI:T:nopass;S:Open;;");
assert.strictEqual(Q.payload("email", { to: "a@b.com", subject: "Hi there", body: "x&y" }), "mailto:a@b.com?subject=Hi%20there&body=x%26y");
assert.strictEqual(Q.payload("phone", { number: "+971 50 123-4567" }), "tel:+971501234567");
// the grid is square, has the three corner squares, and grows with the text
const m = Q.matrix("hello", "M"); assert.strictEqual(m.length, m[0].length);
assert.ok(m[0][0] && m[0][6] && m[6][0] && m[0][m.length - 1] && m[m.length - 1][0], "corner squares");
assert.ok(Q.matrix("x".repeat(200), "M").length > m.length);
assert.throws(() => Q.matrix("x".repeat(5000), "H"), "too much text must fail loudly");
// svg output
["square", "rounded", "dots"].forEach(d => ["square", "rounded", "circle"].forEach(e => { const s = Q.svg("https://a.com", { dots: d, eyes: e }); assert.ok(s.startsWith("<svg") && s.endsWith("</svg>") && !s.includes("NaN") && !s.includes("undefined"), d + e); }));
assert.ok(Q.svg("a", { transparent: true }).indexOf("<rect") === -1, "transparent has no background");
assert.ok(Q.svg("a", { bg: "#ffeedd" }).includes('fill="#ffeedd"'));
const lg = Q.svg("https://a.com", { logo: "data:image/png;base64,AAAA", ecc: "M" });
assert.ok(lg.includes("<image"), "logo present"); assert.ok(!lg.includes("NaN"));
// a logo forces the highest repair level, so the grid is at least as big as H would give
assert.strictEqual(Q.matrix("https://a.com", "H").length, (() => { const mm = lg.match(/viewBox="0 0 (\d+)/); return +mm[1] - 8; })());
// colour checks
assert.ok(Q.contrast("#000000", "#ffffff") > 20); assert.ok(Q.contrast("#777777", "#888888") < 1.5);
assert.ok(Q.warnings({ fg: "#777777", bg: "#888888" }, 10).some(w => /too close/.test(w)));
assert.ok(Q.warnings({ fg: "#ffffff", bg: "#000000" }, 10).some(w => /inverted/.test(w)));
assert.ok(Q.warnings({ fg: "#000000", bg: "#ffffff", logo: "x", logoSize: 28, ecc: "H" }, 10).some(w => /big logo/.test(w)));
assert.deepStrictEqual(Q.warnings({ fg: "#000000", bg: "#ffffff" }, 20), []);
// every dot shape and corner shape draws, stays inside sensible numbers, and has a name
Object.keys(Q.SHAPE_NAMES).forEach(d => { assert.ok(Q.shapePath(d).startsWith("M"), d); Object.keys(Q.EYE_NAMES).forEach(e => { const s = Q.svg("https://a.com/x", { dots: d, eyes: e, logo: "data:image/png;base64,AAAA" }); assert.ok(!/NaN|undefined|Infinity/.test(s), d + e); assert.ok(s.endsWith("</svg>")); }); });
assert.ok(Object.keys(Q.SHAPE_NAMES).length >= 11 && Object.keys(Q.EYE_NAMES).length >= 5);
// decorative shapes warn, the reliable ones do not
["diamond", "small", "plus", "star", "heart"].forEach(d => assert.ok(Q.warnings({ fg: "#000000", bg: "#ffffff", dots: d }, 20).some(w => /decorative/.test(w)), d));
["square", "rounded", "dots", "leaf", "vbars", "hbars"].forEach(d => assert.ok(!Q.warnings({ fg: "#000000", bg: "#ffffff", dots: d }, 20).some(w => /decorative/.test(w)), d));
assert.ok(Q.warnings({ fg: "#000000", bg: "#ffffff", dots: "star" }, 200).some(w => /shorten/.test(w)));
// the three corner squares are kept clear of dot shapes: same corner pixels whatever the dot shape
assert.strictEqual(Q.svg("a", { dots: "star" }).split('fill-rule="evenodd"')[1].split("/>")[0], Q.svg("a", { dots: "square" }).split('fill-rule="evenodd"')[1].split("/>")[0]);
console.log("qr tests passed");
