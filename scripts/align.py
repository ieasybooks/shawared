# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["ctc-forced-aligner==1.0.2", "uroman==1.3.1.1", "librosa", "onnxruntime", "numpy", "requests", "unidecode"]
# ///
"""Force-align a poem's Arabic text to a recording, word by word.

    uv run scripts/align.py content/poems/<id>/poem.json media/work/<id>/app16k.wav
        [--plan 1.1,1.2,...] [--out words.json]
        [--recitation content/poems/<id>/recitations/<reciter>.json [--source <url>]]

The plan lists the half-verses in the order the reciter says them (repeats and
skips allowed). By default it is every half in order. Prints one line per word
with its time and a confidence, flags weak words, and writes the word timings
plus a proposed half-verse timeline to --out. With --recitation it also writes
that timeline into the recitation file (creating it if needed; the reciter is
the file's name and the duration is read from the app audio).

Align the app audio (app16k.wav, made by scripts/audio.ts from the .m4a), so the
times are the ones the app plays.

Model: MMS-300m forced aligner (ONNX), cached in ~/.cache/shawared.
"""
import argparse, json, math, os, re, sys, unicodedata

import numpy as np
import ctc_forced_aligner as cfa
import uroman as ur

MODEL = os.path.expanduser("~/.cache/shawared/mms-300m-forced-aligner.onnx")


def spoken(word):
    """The word's letters as recited: a taa marbuta carrying a vowel is said as t
    (uroman would drop it), and one at a pause as h."""
    word = re.sub(r"ة(?=[\u064B-\u0650])", "ت", word)
    return re.sub(r"ة(?=[\u0651\u0652]?$)", "ه", word)


def romanize(u, word):
    # uroman keeps the vowels written as tashkeel, which helps the aligner.
    r = u.romanize_string(spoken(word)).lower()
    r = re.sub(r"[^a-z']", "", r)
    return r


def strip_marks(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("poem")
    ap.add_argument("audio")
    ap.add_argument("--plan")
    ap.add_argument("--out")
    ap.add_argument("--weak", type=float, default=0.35, help="flag words below this confidence")
    ap.add_argument("--recitation")
    ap.add_argument("--source")
    a = ap.parse_args()

    poem = json.load(open(a.poem, encoding="utf-8"))
    halves = {}
    for b in poem["abyat"]:
        halves[f'{b["n"]}.1'] = b["sadr"].split()
        halves[f'{b["n"]}.2'] = b["ajuz"].split()
    plan = a.plan.split(",") if a.plan else list(halves)
    for h in plan:
        if h not in halves:
            sys.exit(f"plan has {h}, which is not in the poem")

    u = ur.Uroman()
    words = []  # (half, address, arabic, romanized)
    for h in plan:
        for i, w in enumerate(halves[h], 1):
            words.append((h, f"{h}.{i}", w, romanize(u, w)))
    for _, addr, w, r in words:
        if not r:
            sys.exit(f"could not romanize {addr} {w}")

    cfa.ensure_onnx_model(MODEL, cfa.MODEL_URL)
    import onnxruntime
    session = onnxruntime.InferenceSession(MODEL)
    tok = cfa.Tokenizer()
    wave = cfa.load_audio(a.audio)
    emissions, stride = cfa.generate_emissions(session, wave, batch_size=4)

    tokens = []
    for _, _, _, r in words:
        tokens += ["<star>", " ".join(r)]
    segments, scores, blank = cfa.get_alignments(emissions, tokens, tok)
    spans = cfa.get_spans(tokens, segments, blank)
    scores = np.asarray(scores).reshape(-1)

    out_words = []
    for k, (h, addr, w, r) in enumerate(words):
        span = spans[2 * k + 1]
        core = [s for s in span if s.label != blank]
        f0, f1 = core[0].start, core[-1].end + 1
        conf = float(math.exp(scores[f0:f1].mean())) if f1 > f0 else 0.0
        out_words.append({"address": addr, "word": w, "rom": r,
                          "start": round(f0 * stride / 1000, 3), "end": round(f1 * stride / 1000, 3),
                          "conf": round(conf, 3)})

    timeline = []
    for h in plan:
        ws = [x for x in out_words if x["address"].rsplit(".", 1)[0] == h]
        # a half listed twice in the plan: split its words by occurrence
        timeline.append([h, ws[0]["start"], ws[-1]["end"]])
    # repeated halves: rebuild by walking the plan in order
    timeline, i = [], 0
    for h in plan:
        n = len(halves[h])
        ws = out_words[i:i + n]
        i += n
        timeline.append([h, ws[0]["start"], ws[-1]["end"], round(min(x["conf"] for x in ws), 3)])

    for x in out_words:
        flag = "  <-- weak" if x["conf"] < a.weak else ""
        print(f'{x["address"]:>9}  {x["start"]:7.2f} {x["end"]:7.2f}  {x["conf"]:.2f}  {strip_marks(x["word"])}  ({x["rom"]}){flag}')
    print()
    for h, s, e, c in timeline:
        print(f"{h:>6}  {s:7.2f} - {e:7.2f}  ({e - s:4.2f}s)  min word conf {c:.2f}")

    if a.out:
        json.dump({"audio": a.audio, "stride_ms": stride, "words": out_words, "timeline": timeline},
                  open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"\nwrote {a.out}")

    if a.recitation:
        write_recitation(a.recitation, poem["id"], a.source, timeline)


def write_recitation(path, poem_id, source, timeline):
    import subprocess
    rec_id = os.path.splitext(os.path.basename(path))[0]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    audio = f"{poem_id}/{rec_id}.m4a"
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                          os.path.join(root, "media", "audio", audio)], capture_output=True, text=True, check=True)
    old = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    rec = {"reciter": old.get("reciter", rec_id), "audio": audio, "duration": round(float(out.stdout), 2)}
    if source or old.get("source"):
        rec["source"] = source or old["source"]
    lines = ",\n".join(f'    [{json.dumps(h)}, {s:.2f}, {e:.2f}]' for h, s, e, _ in timeline)
    head = ",\n".join(f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}" for k, v in rec.items())
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write("{\n" + head + ',\n  "timeline": [\n' + lines + "\n  ]\n}\n")
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
