# QR Studio

QR codes with your own colours, shapes and logo.

Made by Zero3.

## What it does

I wanted a QR code maker that does not hand me a plain black square, does not push me into a paid plan after one code, and does not send my link to a server. So I built one.

You type a link or text, pick the colours, the dot shape (11 to choose from) and the corner shape (5), optionally drop your logo in the middle, and download it as SVG or PNG.

It makes four kinds of code: a link or any text, a Wi-Fi network (scan to join), an email, and a phone number.

## Use it

Open the app: https://krshnaprsad.github.io/qr-studio/

Or download the repo and open `index.html`. Nothing to install and nothing leaves your computer.

## Things to know

- **Always scan it before you print it.** The tool warns about the usual problems (colours too close, a light code on a dark background, a logo that is too big) but a warning is a guess, and only a real phone tells you the truth. Test on more than one phone if it matters.
- **A logo hides part of the code.** When you add one I switch the code to its highest repair level so it still reads. Above about a quarter of the width it often stops scanning.
- **Some shapes read better than others.** Square, rounded, round dots, leaf, vertical bars and horizontal bars were reliable in my tests. Diamond, small squares, plus, star and heart are decorative. They looked great but failed more often, so the tool warns you when you pick one. Corner shapes circle, cut and leaf were less reliable in a second decoder (OpenCV), so scan those before you print.
- **Light on dark often fails.** My decoder tests failed on a green-on-black leaf code, and many phone scanners reject inverted codes. The tool warns and has a Swap colours button. Corner shapes circle, cut and leaf are also less reliable in some decoders, so scan before you print.
- **A QR code can only hold so much.** If the text is too long you get a message and no code.
- **A Wi-Fi code holds the password in plain text.** Anyone who scans it can join. Share it only where that is fine.
- **These codes do not expire and do not track anything.** The link or text is written straight into the picture. If you need a code you can change later or count scans on, that needs a service, and this is not one.
- SVG is sharp at any size, so use it for print. PNG is for screens and chat apps.

## How I checked it

The tests cover what gets written into each kind of code, every shape, and the warnings. Separately, I rendered every dot shape and every corner shape, with and without a logo, on four different texts, and decoded each one with jsQR, a free reader. I did it three ways: sharp at 300 and 200 pixels, and at 600 pixels with a slight blur to act like a camera.

- Square, rounded, round dots, leaf, vertical bars and horizontal bars: 144 of 144 read back exactly.
- Corner shapes: 120 of 120 with jsQR. A second decoder (OpenCV) struggled with circle and cut corners, and sometimes with leaf corners together with leaf dots.
- Diamond, small squares, plus, star and heart: 100 of 120. Plus and star failed the most, and some shapes only failed with a logo or at one size.

jsQR is a stricter reader than most phone cameras in some ways and weaker in others, so these numbers are a guide, not a promise. A real phone is still the final test, and I have not tried one.

## Files

- `index.html`, `web/` the app
- `src/qr.js` the code that builds the SVG, the warnings and what goes into each code
- `vendor/qrcode.js` the QR maths, from the free qrcode-generator library (MIT, Kazuhiko Arase). See `vendor/NOTICE.md`
- `tests/` the tests

Developer notes are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT. See [LICENSE](LICENSE).
