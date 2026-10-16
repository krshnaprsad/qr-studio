# Contributing

No dependencies to install. You need Node 18 or newer.

```
npm test
```

That runs `tests/qr.test.js`: what goes into each kind of code (Wi-Fi, email, phone), the SVG output for every dot and corner style, the logo rule (a logo forces repair level H), and the colour warnings.

Layout:

- `src/qr.js` has no browser code, so it can be tested in Node. `QRS.svg(text, options)` returns the SVG text.
- `web/app.js` is only the page: it reads the form and calls `QRS`.
- `vendor/qrcode.js` is the qrcode-generator library, minified (see `vendor/NOTICE.md`).

To check a change really scans, render the SVG and decode it with a reader such as jsQR. A test that only checks the SVG text cannot tell you that a phone will read it.

Options for `QRS.svg`: `fg`, `bg`, `transparent`, `dots` (square, rounded, dots, leaf, vbars, hbars, diamond, small, plus, star, heart), `eyes` (square, rounded, circle, leaf, cut), `eyeColor`, `margin`, `ecc` (L, M, Q, H), `logo` (a data URI), `logoSize` (percent of the width).

To add a shape, add a case to `sq()` in `src/qr.js` and a name in `SHAPE_NAMES`. If it is decorative, add it to `FANCY` so the tool warns. Then decode it with a reader at a few sizes before you call it reliable, a shape that only looks right is not enough.
