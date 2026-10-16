(function () {
  var $ = function (s) { return document.querySelector(s); }, kind = "url", logo = "";
  var PH = { url: "https://yourname.com" };
  var ecReset = true, shape = { dots: "square", eyes: "square" };
  function thumb(path, evenodd) { return '<svg viewBox="' + (evenodd ? "-0.6 -0.6 8.2 8.2" : "-0.15 -0.15 1.3 1.3") + '" width="30" height="30"><path fill="#fff" fill-rule="' + (evenodd ? "evenodd" : "nonzero") + '" d="' + path + '"/></svg>'; }
  function picker(id, key, names, paths, fancy) {
    var el = $(id); el.innerHTML = Object.keys(names).map(function (k) { return '<button type="button" class="shp' + (shape[key] === k ? " on" : "") + '" data-k="' + k + '" title="' + names[k] + (fancy[k] ? " (decorative, test it)" : "") + '" aria-label="' + names[k] + '">' + thumb(paths(k), key === "eyes") + "<span>" + names[k] + "</span>" + (fancy[k] ? "<i></i>" : "") + "</button>"; }).join("");
    el.querySelectorAll(".shp").forEach(function (b) { b.onclick = function () { shape[key] = b.dataset.k; el.querySelectorAll(".shp").forEach(function (x) { x.classList.toggle("on", x === b); }); render(); }; });
  }
  function eyeThumb(k) { var e = QRS.eyePath(k); return e.ring + e.mid; }
  function val(id) { return $(id).value; }
  function fields() {
    if (kind === "wifi") return { ssid: val("#ssid"), password: val("#wpass"), security: val("#wsec"), hidden: $("#whid").checked };
    if (kind === "email") return { to: val("#eto"), subject: val("#esub"), body: val("#ebody") };
    if (kind === "phone") return { number: val("#pnum") };
    return { text: val("#text") };
  }
  function opts() {
    return { fg: val("#fg"), bg: val("#bg"), transparent: $("#tr").checked, dots: shape.dots, eyes: shape.eyes, eyeColor: ecReset ? "" : val("#ec"), margin: +val("#margin"), ecc: "M", logo: logo, logoSize: +val("#lsize") };
  }
  function msg(t) { var m = $("#msg"); m.hidden = !t; m.textContent = t || ""; if (t) setTimeout(function () { m.hidden = true; }, 3000); }
  var cur = "";
  function render() {
    var text = QRS.payload(kind, fields()), o = opts(), art = $("#art"), w = $("#warn");
    var empty = kind === "wifi" ? !val("#ssid") : kind === "email" ? !val("#eto") : kind === "phone" ? !val("#pnum") : !text.trim();
    $("#box").style.background = o.transparent ? "repeating-conic-gradient(#1a1a1a 0 25%,#2a2a2a 0 50%) 0 0/16px 16px" : "";
    if (empty) { cur = ""; art.innerHTML = '<p class="note empty">Type something on the left and the code appears here.</p>'; w.innerHTML = ""; setDl(false); return; }
    try { cur = QRS.svg(text, o); } catch (e) { cur = ""; art.innerHTML = '<p class="note empty">That is too much for one QR code. Shorten it.</p>'; w.innerHTML = ""; setDl(false); return; }
    art.innerHTML = cur; setDl(true);
    var list = QRS.warnings(Object.assign({}, o, { ecc: o.logo ? "H" : o.ecc }), text.length);
    var inv = !o.transparent && QRS.isInverted(o);
    w.innerHTML = list.length ? '<ul class="warn">' + list.map(function (x) { return "<li>" + x.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</li>"; }).join("") + "</ul>" : '<p class="ok">No problems spotted. Still scan it with your phone before you print it.</p>';
    if (inv) { var b = document.createElement("button"); b.type = "button"; b.textContent = "Swap colours"; b.onclick = function () { var f = $("#fg"), g = $("#bg"), t = f.value; f.value = g.value; g.value = t; render(); }; w.appendChild(b); }
  }
  function setDl(on) { $("#dpng").disabled = $("#dsvg").disabled = !on; }
  function save(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  $("#dsvg").onclick = function () { if (cur) { save(new Blob([cur], { type: "image/svg+xml" }), "qr-code.svg"); msg(!opts().transparent && QRS.isInverted(opts()) ? "SVG saved. This code is light on dark, so many phones may not scan it." : "SVG saved."); } };
  $("#dpng").onclick = function () {
    if (!cur) return; var px = +val("#psize"), img = new Image();
    img.onload = function () { var c = document.createElement("canvas"); c.width = c.height = px; var g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0, px, px); c.toBlob(function (b) { save(b, "qr-code.png"); msg(!opts().transparent && QRS.isInverted(opts()) ? "PNG saved. This code is light on dark, so many phones may not scan it." : "PNG saved."); }, "image/png"); };
    img.onerror = function () { msg("Could not make the PNG. Try the SVG."); };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(cur);
  };
  document.querySelectorAll(".tab").forEach(function (t) { t.onclick = function () { kind = t.dataset.k; document.querySelectorAll(".tab").forEach(function (x) { x.classList.toggle("on", x === t); }); document.querySelectorAll(".pane").forEach(function (p) { p.hidden = p.dataset.k !== kind; }); render(); }; });
  document.querySelectorAll("input,select,textarea").forEach(function (e) { if (e.id !== "logo" && e.id !== "psize") e.addEventListener("input", function () { if (e.id === "ec") ecReset = false; if (e.id === "lsize") $("#lval").textContent = e.value + "%"; render(); }); });
  $("#ecreset").onclick = function () { ecReset = true; $("#ec").value = val("#fg"); render(); };
  $("#logobtn").onclick = function () { $("#logo").click(); };
  $("#logoclear").onclick = function () { logo = ""; $("#logo").value = ""; $("#logoclear").hidden = $("#lsw").hidden = true; $("#logobtn").textContent = "Add a logo"; render(); };
  $("#logo").onchange = function () {
    var f = this.files[0]; if (!f) return; var fr = new FileReader();
    fr.onload = function () { var im = new Image(); im.onload = function () { var s = Math.min(1, 256 / Math.max(im.width || 256, im.height || 256)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round((im.width || 256) * s)); c.height = Math.max(1, Math.round((im.height || 256) * s)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); logo = c.toDataURL("image/png"); $("#logoclear").hidden = $("#lsw").hidden = false; $("#logobtn").textContent = "Change logo"; render(); }; im.onerror = function () { msg("Could not read that image."); }; im.src = fr.result; };
    fr.readAsDataURL(f);
  };
  $("#fg").addEventListener("input", function () { if (ecReset) $("#ec").value = val("#fg"); });
  picker("#dotpick", "dots", QRS.SHAPE_NAMES, QRS.shapePath, QRS.FANCY);
  picker("#eyepick", "eyes", QRS.EYE_NAMES, eyeThumb, {});
  window.QRStudio = { render: render };
  render();
})();
