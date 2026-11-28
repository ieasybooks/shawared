"""Checks a recitation's text and timings by ear: cuts every timeline entry out of the
app audio, transcribes each clip on its own, and compares what was heard with the text.

    python3 -I scripts/verify.py <poem-id> [<recitation>] [--audio media/work/<id>/app16k.wav]

A clip whose transcript differs from its half is listed with both, word by word. Words
are compared without long vowels and hamza, so a stretched vowel isn't a difference. The
transcriber makes mistakes too (rare words, names, a dropped و), so a difference is a
place to listen, not a verdict. A clip that hears words from the next or previous half
means its timing is off. Writes the clips and transcripts under media/work/verify/<poem>/.

Set TAFRIGH to another tafrigh binary (a CUDA build, say) to use it instead of tafrigh-rs.
"""
import argparse, difflib, json, os, re, shutil, subprocess, sys, unicodedata

# The documented -I invocation omits the script directory from Python's import path.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from recording import repository_root, source_path

ROOT = repository_root()
PAD = 0.05


def skeleton(w):
    """A word without its long vowels, hamza or final ن: recitation stretches vowels (شاك
    for شكّ) and the rhyme's, which a transcript writes as letters."""
    # A final ن goes too: tanwin is heard as one, and a stretched rhyme often is (مشفقين).
    return re.sub(r"ن$", "", re.sub(r"[اويىء]", "", w)) or w


def norm(s):
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"[ً-ْٰـ]", "", s)  # harakat, dagger alif, tatweel
    s = re.sub(r"[أإآٱ]", "ا", s)
    s = s.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    s = re.sub(r"[^ء-ي ]+", " ", s)
    return s.split()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("poem")
    ap.add_argument("recitation", nargs="?")
    ap.add_argument("--audio")
    ap.add_argument("--reuse", action="store_true", help="compare again with the last run's transcripts (after a text edit)")
    a = ap.parse_args()
    poem_id = a.poem
    pdir = os.path.join(ROOT, "content", "poems", poem_id)
    with open(os.path.join(pdir, "poem.json"), encoding="utf-8") as file:
        poem = json.load(file)
    recs = sorted(f[:-5] for f in os.listdir(os.path.join(pdir, "recitations")) if f.endswith(".json"))
    rec_id = a.recitation or recs[0]
    with open(os.path.join(pdir, "recitations", f"{rec_id}.json"), encoding="utf-8") as file:
        rec = json.load(file)
    audio = a.audio or str(source_path(ROOT, poem_id, rec_id))

    halves = {}
    for b in poem["abyat"]:
        halves[f'{b["n"]}.1'] = b["sadr"]
        halves[f'{b["n"]}.2'] = b["ajuz"]

    out = os.path.join(ROOT, "media", "work", "verify", poem_id, rec_id)
    clips, heard = os.path.join(out, "clips"), os.path.join(out, "asr")
    names = [(f"{i:03d}_{addr}", addr) for i, (addr, _, _) in enumerate(rec["timeline"])]
    if not a.reuse:
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(clips)
        for (name, _), (_, s, e) in zip(names, rec["timeline"]):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, s - PAD):.3f}", "-to", f"{e + PAD:.3f}",
                            "-i", audio, "-ac", "1", "-ar", "16000", os.path.join(clips, f"{name}.wav")], check=True)
    if not a.reuse: subprocess.run([os.environ.get("TAFRIGH", "tafrigh-rs"), clips, "--transcriber", "cohere", "-q", "-f", "json", "-o", heard], check=True, stdout=subprocess.DEVNULL)

    flagged, edges, words_total, words_off = [], [], 0, 0
    for name, addr in names:
        with open(os.path.join(heard, f"{name}.json"), encoding="utf-8") as file:
            segs = json.load(file)
        got = norm(" ".join(x["text"] for x in segs))
        text = halves[addr] if "." in addr else halves[f"{addr}.1"] + " " + halves[f"{addr}.2"]
        want = norm(text)
        sm = difflib.SequenceMatcher(a=[skeleton(w) for w in want], b=[skeleton(w) for w in got], autojunk=False)
        ops = [o for o in sm.get_opcodes() if o[0] != "equal"]
        # One extra word at either end is usually a sliver of the neighbouring half.
        for o in list(ops):
            op, a1, a2, b1, b2 = o
            if op == "insert" and b2 - b1 == 1 and (b1 == 0 or b2 == len(got)):
                ops.remove(o)
                edges.append(f"{addr} {'starts' if b1 == 0 else 'ends'} with «{got[b1]}»")
        diffs = [(op, " ".join(want[a1:a2]), " ".join(got[b1:b2])) for op, a1, a2, b1, b2 in ops]
        words_total += len(want)
        words_off += sum(max(a2 - a1, b2 - b1) for op, a1, a2, b1, b2 in ops)
        if diffs:
            flagged.append((addr, text, " ".join(got), diffs))

    for addr, text, got, diffs in flagged:
        print(f"{addr:>6}  text:  {text}")
        print(f"{'':>6}  heard: {got}")
        print(f"{'':>6}  " + "   ".join(f"«{w}» → «{g}»" if op == "replace" else (f"missing «{w}»" if op == "delete" else f"extra «{g}»") for op, w, g in diffs))
        print()
    if edges:
        print("A word heard at a clip's edge (a sliver of the next or previous half, or a timing to check):")
        print("  " + "; ".join(edges) + "\n")
    print(f"{len(names)} clips, {len(flagged)} with differences; {words_off} of {words_total} words differ ({100 * words_off / max(1, words_total):.1f}%)")


if __name__ == "__main__":
    main()
