"""Collates a poem's text against other editions, bayt by bayt, ignoring harakat and
spelling of hamza, ta marbuta and alif maqsura. Each edition is a text file in which
every bayt is one line, its halves split by " ... " (as shamela prints them); other lines,
such as commentary, are skipped.

    python3 -I scripts/collate.py <base> <edition>...

<base> is a poem.json or a text file in the same shape as the editions. For every bayt
it prints the words where an edition differs, the abyat an edition lacks, and the abyat
an edition has that the base doesn't (where they would fall). Name each edition's file
after its source (wahidi.txt, maarri.txt); the name is how it's cited in the output.
"""
import difflib, json, os, re, sys, unicodedata


def norm(s):
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"[ً-ْٰـ]", "", s)
    s = re.sub(r"[أإآٱ]", "ا", s)
    s = s.replace("ى", "ي").replace("ة", "ه")
    s = re.sub(r"[^ء-ي ]+", " ", s)
    return s.split()


def abyat_of(path):
    if path.endswith(".json"):
        return [(b["sadr"], b["ajuz"]) for b in json.load(open(path, encoding="utf-8"))["abyat"]]
    out = []
    for line in open(path, encoding="utf-8"):
        line = line.strip().strip("[]").strip()
        if " ... " in line:
            a, b = line.split(" ... ", 1)
            if len(norm(a)) >= 2 and len(norm(b)) >= 2:
                out.append((a.strip(), b.strip()))
    return out


def ratio(x, y):
    return difflib.SequenceMatcher(a=x, b=y, autojunk=False).ratio()


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    base = abyat_of(sys.argv[1])
    eds = {os.path.splitext(os.path.basename(p))[0]: abyat_of(p) for p in sys.argv[2:]}
    bw = [norm(a) + ["|"] + norm(b) for a, b in base]
    matches = {}  # edition -> base index -> edition index
    for name, ab in eds.items():
        ew = [norm(a) + ["|"] + norm(b) for a, b in ab]
        m, used = {}, set()
        for i, w in enumerate(bw):
            best = max(((ratio(w, e), j) for j, e in enumerate(ew) if j not in used), default=(0, -1))
            if best[0] >= 0.55:
                m[i] = best[1]
                used.add(best[1])
        matches[name] = (m, ew, ab, used)

    for i, w in enumerate(bw):
        notes = []
        for name, (m, ew, ab, _) in matches.items():
            if i not in m:
                notes.append(f"    {name}: not there")
                continue
            e = ew[m[i]]
            sm = difflib.SequenceMatcher(a=w, b=e, autojunk=False)
            d = [f"«{' '.join(w[a1:a2]) or '—'}» → «{' '.join(e[b1:b2]) or '—'}»" for op, a1, a2, b1, b2 in sm.get_opcodes() if op != "equal"]
            if d:
                notes.append(f"    {name} (its bayt {m[i] + 1}): " + "; ".join(d))
        if notes:
            print(f"{i + 1:>3}  {base[i][0]}  ...  {base[i][1]}")
            print("\n".join(notes))
    for name, (m, ew, ab, used) in matches.items():
        extra = [j for j in range(len(ab)) if j not in used]
        if extra:
            print(f"\n{name} has abyat the base doesn't:")
            for j in extra:
                print(f"    its bayt {j + 1}: {ab[j][0]}  ...  {ab[j][1]}")
    print(f"\nbase {len(base)} abyat; " + ", ".join(f"{n} {len(v[2])}" for n, v in matches.items()))


if __name__ == "__main__":
    main()
