# QR Studio

QR codes with your own colours, shapes and logo.

Made by Zero3.

## Why I built QR Studio

Sometimes a client needs a QR code. I make one from their website, and when it is scanned it opens that website, doing exactly what the QR code is for. It also works with my phone number: scan the code and it calls me, or opens WhatsApp. Anything a QR code is needed for, QR Studio does it.

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
- **There is a live scan check.** Under the preview I read your finished code back with a software reader and tell you if it scans or may not. It is one reader, not a phone, so a green tick is a good sign and not a promise.
- **Some shapes read better than others.** Square, rounded, round dots, small squares, leaf and vertical bars read back every time in my tests. Diamond, horizontal bars, plus, star and heart are decorative and failed more often, so the tool warns you when you pick one.
- **Light on dark is risky.** Many phone scanners skip codes that are lighter than their background. My test readers only got them when I let them try inverted. The tool warns you and has a Swap colours button that gives you a dark code on a light background.
- **Repair level is Q by default,** so a code survives some damage or a fancy shape. Adding a logo switches it to H.
- **A QR code can only hold so much.** If the text is too long you get a message and no code.
- **A Wi-Fi code holds the password in plain text.** Anyone who scans it can join. Share it only where that is fine.
- **These codes do not expire and do not track anything.** The link or text is written straight into the picture. If you need a code you can change later or count scans on, that needs a service, and this is not one.
- SVG is sharp at any size, so use it for print. PNG is for screens and chat apps.

## How I checked it

The tests cover what gets written into each kind of code, every shape, and the warnings. Separately I drew each shape as a PNG at 1024, 400 and 250 pixels, in black on white and in green (#6aa32f) on white, with a phone number as the text. I read each one with three free readers: jsQR, zxing and OpenCV. Results are reads out of attempts:

| Dot shape | OpenCV | zxing | jsQR |
|---|---|---|---|
| Square, rounded, round dots, small squares, vertical bars | 12/12 | 12/12 | 12/12 |
| Leaf | 12/12 | 12/12 | 10/12 |
| Diamond | 12/12 | 12/12 | 8/12 |
| Star | 12/12 | 12/12 | 8/12 |
| Heart | 10/12 | 12/12 | 7/12 |
| Plus | 8/12 | 12/12 | 6/12 |
| Horizontal bars | 8/12 | 10/12 | 9/12 |

Corner shapes (square, rounded, circle, leaf, cut) were tested with square dots and with leaf dots, in black, green, dark green, green on black and white on black. OpenCV and zxing read all of them. jsQR read 27 of 30 for each, and the misses were the 1024 pixel leaf-dot renders. The inverted ones (light on dark) were only read when the reader was allowed to try inverting, which many phones do not do.

I made the circle, cut and leaf corners less extreme in v1.2 because OpenCV could not read the older, rounder ones. Those readers are stricter than a phone camera in some ways and looser in others, so treat this as a guide. I have not tried it on a real phone.

## Files

- `index.html`, `web/` the app
- `src/qr.js` the code that builds the SVG, the warnings and what goes into each code
- `vendor/jsqr.js` the reader behind the live scan check (jsQR, Apache 2.0, Cosmo Wolfe)
- `vendor/qrcode.js` the QR maths, from the free qrcode-generator library (MIT, Kazuhiko Arase). See `vendor/NOTICE.md`
- `tests/` the tests

Developer notes are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

I made this and it is free to use, including for paid work. What it is not free to do is be copied: please don't republish, redistribute or sell the code, or build your own version from it. The full terms are in [LICENSE](LICENSE). Versions published before 19 October 2026 were MIT and stay that way. The Zero3 name and logo are not part of the licence.

The libraries in `vendor/` are not mine and keep their own licences, see `vendor/NOTICE.md`.
