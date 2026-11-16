"""Prints pages of a book on shamela.ws as plain text, for research: the editions a poem's
text is collated against and the commentaries its sharh draws on.

    python3 -I scripts/shamela.py <book-id> <first-page> [<last-page>] > media/research/<poem>/<name>.txt

Page numbers are shamela's own (the number in the page's address), not the printed ones;
each page starts with a line giving both, so a reading can be cited.
"""
import html, re, sys, time, urllib.request


def page(book, n):
    req = urllib.request.Request(f"https://shamela.ws/book/{book}/{n}", headers={"User-Agent": "Mozilla/5.0"})
    s = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    printed = re.search(r"<title>\s*ص(\d+)", s)
    m = re.search(r'<div class="nass[^"]*"[^>]*>(.*?)</div>\s*(?:<div class="text-center|<hr|</div>)', s, re.S)
    body = m.group(1) if m else ""
    body = re.sub(r"<br\s*/?>|</p>", "\n", body)
    body = html.unescape(re.sub(r"<[^>]+>", "", body))
    body = re.sub(r"[ \t]+\n", "\n", re.sub(r"\n\s*\n+", "\n", body)).strip()
    return f"=== shamela {book}/{n}" + (f" (printed p. {printed.group(1)})" if printed else ""), body


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    book, first = sys.argv[1], int(sys.argv[2])
    last = int(sys.argv[3]) if len(sys.argv) > 3 else first
    for n in range(first, last + 1):
        head, body = page(book, n)
        print(head)
        print(body)
        print()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
