"""Finds a poem in a scanned edition on archive.org and fetches the pages, to read and cite.

    python3 -I scripts/archive.py find <words of a title>       # items: id, title
    python3 -I scripts/archive.py grep <item> <word> [<word> ...]  # pages whose OCR has them all
    python3 -I scripts/archive.py page <item> <n> [<last>]        # page images, to read

The OCR of a voweled Arabic page is rough, so grep for short, distinctive words without
harakat (the rhyme words of two abyat work well) and read the page image itself: the image
is the source, never the OCR. `page` numbers are the scan's leaf indices that `grep`
prints, not the printed page numbers; cite the printed number you read on the image.
Everything is cached in media/research/_archive/<item>/.
"""
import gzip, json, re, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "media" / "research" / "_archive"
UA = {"User-Agent": "Mozilla/5.0"}
MARKS = re.compile(r"[ؐ-ًؚ-ٰٟـ]")


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()


def norm(s):
    s = MARKS.sub("", s)
    s = re.sub("[أإآٱ]", "ا", s)
    return s.replace("ى", "ي").replace("ة", "ه")


def find(words):
    q = urllib.parse.urlencode({"q": " ".join(words), "fl[]": ["identifier", "title"], "rows": 40, "output": "json"}, doseq=True)
    for d in json.loads(get(f"https://archive.org/advancedsearch.php?{q}"))["response"]["docs"]:
        print(d["identifier"], " ", d.get("title"))


def files(item):
    return json.loads(get(f"https://archive.org/metadata/{item}/files"))["result"]


def ocr(item):
    """The OCR text, one string per leaf."""
    cache = ROOT / item / "pages.json"
    if cache.exists():
        return json.loads(cache.read_text())
    names = {f["name"] for f in files(item)}
    base = lambda suffix: next((n for n in sorted(names) if n.endswith(suffix)), None)
    text, index = base("_hocr_searchtext.txt.gz"), base("_hocr_pageindex.json.gz")
    pages = []
    if text and index:
        s = gzip.decompress(get(f"https://archive.org/download/{item}/{urllib.parse.quote(text)}")).decode("utf-8")
        for a, b, *_ in json.loads(gzip.decompress(get(f"https://archive.org/download/{item}/{urllib.parse.quote(index)}"))):
            pages.append(s[a:b])
    else:
        djvu = base("_djvu.txt")
        if not djvu:
            sys.exit(f"{item} has no OCR text")
        pages = get(f"https://archive.org/download/{item}/{urllib.parse.quote(djvu)}").decode("utf-8").split("\f")
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(pages, ensure_ascii=False))
    return pages


def grep(item, words):
    pages = ocr(item)
    want = [norm(w) for w in words]
    hits = 0
    for n, t in enumerate(pages):
        flat = norm(t)
        if all(w in flat for w in want):
            hits += 1
            i = flat.find(want[0])
            print(f"leaf {n}: …{' '.join(flat[max(0, i - 60):i + 80].split())}…")
    print(f"{hits} of {len(pages)} leaves")


def page(item, first, last):
    for n in range(first, last + 1):
        out = ROOT / item / f"n{n}.jpg"
        if not out.exists():
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(get(f"https://archive.org/download/{item}/page/n{n}.jpg"))
        print(out)


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    if a[0] == "find":
        return find(a[1:])
    if a[0] == "grep" and len(a) >= 3:
        return grep(a[1], a[2:])
    if a[0] == "page" and len(a) >= 3:
        return page(a[1], int(a[2]), int(a[3]) if len(a) > 3 else int(a[2]))
    sys.exit(__doc__)


if __name__ == "__main__":
    main()
