# QR Studio

QR codes with your own colours, shapes and logo.

Made by Zero3.

## What it does

I wanted a QR code maker that does not hand me a plain black square, does not push me into a paid plan after one code, and does not send my link to a server. So I built one.

You type a link or text, pick the colours, the dot shape and the corner shape, optionally drop your logo in the middle, and download it as SVG or PNG.

It makes four kinds of code: a link or any text, a Wi-Fi network (scan to join), an email, and a phone number.

## Use it

Open the app: https://krshnaprsad.github.io/qr-studio/

Or download the repo and open `index.html`. Nothing to install and nothing leaves your computer.

## Things to know

- **Always scan it before you print it.** The tool warns about the usual problems (colours too close, a light code on a dark background, a logo that is too big) but a warning is a guess, and only a real phone tells you the truth. Test on more than one phone if it matters.
- **A logo hides part of the code.** When you add one I switch the code to its highest repair level so it still reads. Above about a quarter of the width it often stops scanning.
- **Round dots look nice and read worse than squares.** Fine for a short link, riskier for long text.
- **Light on dark can fail.** Some scanners cannot read inverted codes.
- **A QR code can only hold so much.** If the text is too long you get a message and no code.
- **A Wi-Fi code holds the password in plain text.** Anyone who scans it can join. Share it only where that is fine.
- **These codes do not expire and do not track anything.** The link or text is written straight into the picture. If you need a code you can change later or count scans on, that needs a service, and this is not one.
- SVG is sharp at any size, so use it for print. PNG is for screens and chat apps.

## How I checked it

The tests cover what gets written into each kind of code and the warnings. Separately, I rendered 72 combinations of text, dot shape, corner shape and logo and decoded each one with jsQR, a free reader. 69 read back exactly. The 3 that did not were round dots on a long text with non-English characters and no logo. That matches the warning above. A real phone is still the final test.

## Files

- `index.html`, `web/` the app
- `src/qr.js` the code that builds the SVG, the warnings and what goes into each code
- `vendor/qrcode.js` the QR maths, from the free qrcode-generator library (MIT, Kazuhiko Arase). See `vendor/NOTICE.md`
- `tests/` the tests

Developer notes are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT. See [LICENSE](LICENSE).
