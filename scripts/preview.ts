// Writes a review page for one poem: the real audio with the lines lighting up
// as they're recited, plus every translation, explanation and word note.
// It's for checking content, not the app's design.
//
//   bun scripts/preview.ts <poem-id>   ->  media/preview/<poem-id>.html
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const id = process.argv[2];
if (!id) {
  console.error("usage: bun scripts/preview.ts <poem-id>");
  process.exit(1);
}
const dir = join(ROOT, "content", "poems", id);
const read = (f: string) => JSON.parse(readFileSync(f, "utf8"));

const poem = read(join(dir, "poem.json"));
const langs = readdirSync(dir)
  .filter((f) => /^[a-z]{2}(\.[a-z0-9-]+)?\.json$/.test(f))
  .sort()
  .map((f) => read(join(dir, f)));
const recDir = join(dir, "recitations");
const recs = existsSync(recDir)
  ? readdirSync(recDir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => read(join(recDir, f)))
  : [];
const person = (kind: string, pid: string) => {
  const d = join(ROOT, "content", kind, pid);
  if (!existsSync(d)) return { id: pid };
  const out: Record<string, unknown> = {};
  for (const f of readdirSync(d)) out[f.replace(/\.json$/, "")] = read(join(d, f));
  return out;
};
const data = {
  poem,
  langs,
  recs,
  poet: person("poets", poem.poet),
  reciters: Object.fromEntries(recs.map((r: { reciter: string }) => [r.reciter, person("reciters", r.reciter)])),
};

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview · ${poem.id}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Readex+Pro:wght@300;400;500&display=swap">
<style>
:root{--bg:#EFEBE2;--surface:#F9F7F2;--line:#DDD6C8;--fg:#1A2036;--muted:#5B6078;--rest:#8A8EA0;--accent:#B8650C;
  --f-verse:"Amiri",serif;--f-tr:"Newsreader",Georgia,serif;--f-ui:"Readex Pro",Tahoma,sans-serif;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0E1424;--surface:#161E35;--line:#26304F;--fg:#ECE5D3;--muted:#8F97B2;--rest:#6E7694;--accent:#E8A33C;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0E1424;--surface:#161E35;--line:#26304F;--fg:#ECE5D3;--muted:#8F97B2;--rest:#6E7694;--accent:#E8A33C;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--f-ui);font-size:15px;line-height:1.7}
p{margin:0}
[hidden]{display:none!important}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:14px 16px 12px}
.hd{max-width:860px;margin:0 auto;display:grid;gap:8px}
h1{margin:0;font-family:var(--f-verse);font-weight:700;font-size:1.7rem;line-height:1.3}
.meta{color:var(--muted);font-size:.85rem}
.bar{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}
audio{width:min(100%,420px);height:36px}
.bar label{display:inline-flex;gap:6px;align-items:center;font-size:.85rem;color:var(--muted);cursor:pointer}
main{max-width:860px;margin:0 auto;padding:18px 16px 120px;display:grid;gap:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.card h2{margin:0 0 6px;font-size:.8rem;font-weight:500;letter-spacing:.06em;color:var(--muted)}
.ltr{direction:ltr;text-align:left}
.en-p{font-family:var(--f-tr);font-size:1.02rem}
.bayt{display:grid;grid-template-columns:40px 1fr;gap:10px;padding:14px 16px;border-radius:14px;border:1px solid transparent;transition:background .2s}
.bayt.on{background:var(--surface);border-color:var(--line)}
.num{all:unset;cursor:pointer;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:.85rem;color:var(--muted);border:1px solid var(--line)}
.num:hover,.bayt.on .num{color:var(--accent);border-color:var(--accent)}
.halves{display:grid;gap:4px}
.h{display:grid;gap:0;text-align:center}
.ar{font-family:var(--f-verse);font-size:1.55rem;line-height:1.9;color:var(--rest);transition:color .2s}
.h.on .ar{color:var(--fg)}
.h.on .ar::after{content:"";display:inline-block;width:7px;height:7px;margin-inline-start:10px;background:var(--accent);transform:rotate(45deg) translateY(-3px)}
.t{font-family:var(--f-ui);font-size:.72rem;color:var(--rest);direction:ltr;text-align:center}
.tr{font-family:var(--f-tr);font-size:1.02rem;line-height:1.5;color:var(--muted);direction:ltr;text-align:center;margin-bottom:6px}
.h.on .tr{color:var(--fg)}
.trs{margin-top:4px}
.g{cursor:pointer;text-decoration:underline dotted var(--accent);text-underline-offset:9px;text-decoration-thickness:2px}
.g.sel{color:var(--accent)}
.notes{display:grid;gap:10px;margin-top:10px}
.note{border-top:1px solid var(--line);padding-top:10px;display:grid;gap:4px}
.note .lbl{font-size:.75rem;color:var(--muted)}
.note .w{font-family:var(--f-verse);font-size:1.25rem}
.note .root{font-size:.8rem;color:var(--muted)}
.sharh{font-size:.95rem}
.sharh.en-p{font-size:1rem}
body:not(.show-t) .t{display:none}
body:not(.show-tr) .tr{display:none}
body:not(.show-ex) .ex{display:none}
</style>
</head>
<body class="show-tr show-ex show-t">
<header><div class="hd">
  <h1 id="title"></h1>
  <p class="meta" id="meta"></p>
  <div class="bar">
    <audio id="audio" controls preload="auto"></audio>
    <label><input type="checkbox" data-c="show-tr" checked> الترجمة</label>
    <label><input type="checkbox" data-c="show-ex" checked> الشروح</label>
    <label><input type="checkbox" data-c="show-t" checked> التوقيت</label>
    <label><input type="checkbox" id="follow" checked> متابعة</label>
  </div>
</div></header>
<main id="main"></main>
<script>
const D = ${JSON.stringify(data)};
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const P = D.poem, rec = D.recs[0];
const ar = D.langs.filter((l) => l.lang === "ar"), others = D.langs.filter((l) => l.lang !== "ar");
const en = others.find((l) => l.lang === "en");

$("#title").textContent = P.title;
const poetName = D.poet.poet?.name ?? P.poet;
const recName = rec ? (D.reciters[rec.reciter]?.reciter?.name ?? rec.reciter) : "بلا تسجيل";
$("#meta").innerHTML = esc(poetName) + " · إلقاء " + esc(recName) + " · " + P.abyat.length + " أبيات" + (en?.title ? ' · <span class="ltr" dir="ltr">' + esc(en.title) + "</span>" : "");
if (rec) $("#audio").src = "../audio/" + rec.audio;

// intro + poet cards
const main = $("#main");
const card = (title, body, dir) => '<section class="card' + (dir === "ltr" ? " ltr" : "") + '" dir="' + (dir || "rtl") + '"><h2>' + esc(title) + "</h2>" + body + "</section>";
for (const l of D.langs) if (l.intro) main.insertAdjacentHTML("beforeend", card(l.lang === "ar" ? "عن القصيدة · " + l.source.name : "About the poem · " + l.source.name, '<p class="' + (l.lang === "ar" ? "sharh" : "sharh en-p") + '">' + esc(l.intro) + "</p>", l.lang === "ar" ? "rtl" : "ltr"));
for (const [k, v] of Object.entries(D.poet)) if (v.bio) main.insertAdjacentHTML("beforeend", card(k === "ar" ? "عن الشاعر" : "About the poet", '<p class="' + (k === "ar" ? "sharh" : "sharh en-p") + '">' + esc(v.bio) + "</p>", k === "ar" ? "rtl" : "ltr"));

// which word notes cover which word: "n.h.w" -> [{lang, source, addr, note}]
const notes = {};
for (const l of D.langs) for (const [addr, note] of Object.entries(l.words || {})) {
  const m = addr.match(/^(\\d+)\\.([12])\\.(\\d+)(?:-(\\d+))?$/);
  for (let w = +m[3]; w <= +(m[4] || m[3]); w++) (notes[m[1] + "." + m[2] + "." + w] ||= []).push({ l, addr, note });
}
const times = {};
if (rec) for (const [a, s, e] of rec.timeline) (times[a] ||= []).push([s, e]);
const fmt = (x) => x.toFixed(2);

const halfHTML = (b, h, text) => {
  const words = text.split(" ").map((w, i) => {
    const key = b.n + "." + h + "." + (i + 1);
    return notes[key] ? '<span class="g" data-k="' + key + '">' + esc(w) + "</span>" : esc(w);
  }).join(" ");
  const t = (times[b.n + "." + h] || []).map(([s, e]) => fmt(s) + "–" + fmt(e)).join(", ");
  const tr = Array.isArray(en?.abyat?.[b.n]?.translation) ? '<p class="tr">' + esc(en.abyat[b.n].translation[h - 1]) + "</p>" : "";
  return '<div class="h" data-a="' + b.n + "." + h + '"><p class="ar">' + words + '</p><p class="t">' + (t || "not timed") + "</p>" + tr + "</div>";
};

for (const b of P.abyat) {
  const one = en?.abyat?.[b.n]?.translation;
  const ex = D.langs.filter((l) => l.abyat?.[b.n]?.sharh).map((l) =>
    '<div class="note ex' + (l.lang === "ar" ? "" : " ltr") + '" dir="' + (l.lang === "ar" ? "rtl" : "ltr") + '"><span class="lbl">' + esc(l.lang === "ar" ? "الشرح · " + l.source.name : "Explanation · " + l.source.name) + '</span><p class="sharh' + (l.lang === "ar" ? "" : " en-p") + '">' + esc(l.abyat[b.n].sharh) + "</p></div>").join("");
  main.insertAdjacentHTML("beforeend",
    '<article class="bayt" data-n="' + b.n + '"><button class="num" data-play="' + b.n + '" title="Play from here">' + b.n + "</button>" +
    '<div class="halves">' + halfHTML(b, 1, b.sadr) + halfHTML(b, 2, b.ajuz) +
    (typeof one === "string" ? '<p class="tr trs">' + esc(one) + "</p>" : "") +
    '<div class="notes">' + ex + '<div class="wn"></div></div></div></article>');
}

// word notes open under their bayt
main.addEventListener("click", (e) => {
  const g = e.target.closest(".g");
  if (g) {
    const art = g.closest(".bayt"), box = $(".wn", art), was = g.classList.contains("sel");
    art.querySelectorAll(".g.sel").forEach((x) => x.classList.remove("sel"));
    box.innerHTML = "";
    if (was) return;
    const list = notes[g.dataset.k];
    const addrs = new Set(list.map((x) => x.addr));
    art.querySelectorAll(".g").forEach((x) => { if (notes[x.dataset.k].some((y) => addrs.has(y.addr))) x.classList.add("sel"); });
    box.innerHTML = list.map(({ l, addr, note }) => {
      const isAr = l.lang === "ar";
      return '<div class="note' + (isAr ? "" : " ltr") + '" dir="' + (isAr ? "rtl" : "ltr") + '"><span class="lbl">' + esc((isAr ? "معنى · " : "Meaning · ") + l.source.name + " · " + addr) + '</span><span class="w" dir="rtl">' + esc(note.head || note.word) + (note.root ? ' <span class="root">' + esc(note.root) + "</span>" : "") + '</span><p class="' + (isAr ? "sharh" : "sharh en-p") + '">' + esc(note.meaning) + "</p></div>";
    }).join("");
    return;
  }
  const n = e.target.closest("[data-play]");
  if (n && rec) {
    const first = rec.timeline.find(([a]) => a.split(".")[0] === n.dataset.play);
    if (first) { audio.currentTime = Math.max(0, first[1] - 0.15); audio.play(); userAt = 0; }
  }
});

// follow the audio
const audio = $("#audio");
let cur = null, userAt = 0;
addEventListener("wheel", () => (userAt = performance.now()), { passive: true });
addEventListener("touchmove", () => (userAt = performance.now()), { passive: true });
function tick() {
  if (rec) {
    const t = audio.currentTime;
    let hit = null;
    for (const [a, s] of rec.timeline) if (t >= s - 0.05) hit = a; // hold the last line through pauses
    if (t < rec.timeline[0][1] - 0.05) hit = null;
    if (hit !== cur) {
      document.querySelectorAll(".on").forEach((x) => x.classList.remove("on"));
      if (hit) {
        const n = hit.split(".")[0];
        const art = document.querySelector('.bayt[data-n="' + n + '"]');
        art?.classList.add("on");
        (hit.includes(".") ? [hit] : [n + ".1", n + ".2"]).forEach((a) => document.querySelector('.h[data-a="' + a + '"]')?.classList.add("on"));
        if ($("#follow").checked && !audio.paused && performance.now() - userAt > 5000) art?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      cur = hit;
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
document.querySelectorAll("[data-c]").forEach((c) => c.addEventListener("change", () => document.body.classList.toggle(c.dataset.c, c.checked)));
</script>
</body>
</html>
`;

const outDir = join(ROOT, "media", "preview");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${id}.html`);
writeFileSync(out, html);
console.log(out);
