# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["ctc-forced-aligner==1.0.2", "uroman==1.3.1.1", "librosa", "onnxruntime", "numpy", "requests", "unidecode"]
# ///
"""Which reading did the reciter say? Scores each candidate text against one
stretch of the audio and ranks them.

    uv run scripts/variants.py <audio> <start> <end> "reading one" "reading two" ...

Use it where editions disagree (a vowel, a word). Candidates should differ only
where the editions differ. The score is the aligner's total log-probability; the
difference between the best two is what matters (a gap under ~2 is a coin toss).
"""
import re, sys

import numpy as np
import ctc_forced_aligner as cfa
import uroman as ur
import onnxruntime

MODEL = __import__("os").path.expanduser("~/.cache/shawared/mms-300m-forced-aligner.onnx")


def romanize(u, word):
    """As scripts/align.py does: a voweled taa marbuta is said as t, a pausal one as h."""
    word = re.sub(r"ة(?=[\u064B-\u0650])", "ت", word)
    word = re.sub(r"ة(?=[\u0651\u0652]?$)", "ه", word)
    return re.sub(r"[^a-z']", "", u.romanize_string(word).lower())


def main():
    audio, start, end, *cands = sys.argv[1:]
    start, end = float(start), float(end)
    u = ur.Uroman()
    wave = cfa.load_audio(audio)
    a, b = int(max(0, start - 0.3) * 16000), int((end + 0.3) * 16000)
    session = onnxruntime.InferenceSession(MODEL)
    em, _ = cfa.generate_emissions(session, wave[a:b], batch_size=1)
    tok = cfa.Tokenizer()
    rows = []
    for c in cands:
        tokens = []
        for w in c.split():
            r = romanize(u, w)
            tokens += ["<star>", " ".join(r)]
        _, scores, _ = cfa.get_alignments(em, tokens, tok)
        rows.append((float(np.asarray(scores).sum()), c, " ".join(t.replace(" ", "") for t in tokens if t != "<star>")))
    rows.sort(reverse=True)
    best = rows[0][0]
    for s, c, r in rows:
        print(f"{s:9.2f}  ({s - best:+6.2f})  {c}   [{r}]")


if __name__ == "__main__":
    main()
