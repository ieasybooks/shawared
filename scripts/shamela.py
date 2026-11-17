"""Research on shamela.ws: the editions a poem's text is collated against and the
commentaries its sharh draws on.

    python3 -I scripts/shamela.py <book-id> <first-page> [<last-page>] > media/research/<poem>/<name>.txt
    python3 -I scripts/shamela.py search '"<exact phrase>"' [<word> ...] [--book ID] [--page N]
    python3 -I scripts/shamela.py books <part of a title>

Page numbers are shamela's own (the number in the page's address), not the printed ones;
each page starts with a line giving both, so a reading can be cited.

`search` runs the site's full-text search: a phrase in double quotes must appear as it is,
bare words may appear anywhere on the page, and diacritics are ignored. Search a rare
half of a bayt to find every book that quotes the poem. `books` finds a book's id.

Many diwans aren't on the current site but are on the old one, as a download:
`scripts/shamela-old.py` reads those.
"""
import html, json, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url, data=None, headers=None):
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers={**UA, **(headers or {})})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8")


def text(fragment):
    fragment = re.sub(r"<br\s*/?>|</p>", "\n", fragment)
    fragment = html.unescape(re.sub(r"<[^>]+>", "", fragment))
    return re.sub(r"[ \t]+\n", "\n", re.sub(r"\n\s*\n+", "\n", fragment)).strip()


def page(book, n):
    s = fetch(f"https://shamela.ws/book/{book}/{n}")
    printed = re.search(r"<title>\s*(?:ج(\d+)\s*-\s*)?ص(\d+)", s)
    m = re.search(r'<div class="nass[^"]*"[^>]*>(.*?)</div>\s*(?:<div class="text-center|<hr|</div>)', s, re.S)
    ref = ""
    if printed:
        ref = f" (printed {'vol. ' + printed.group(1) + ', ' if printed.group(1) else ''}p. {printed.group(2)})"
    return f"=== shamela {book}/{n}{ref}", text(m.group(1) if m else "")


def search(term, page_no=1, book=None):
    data = [("term", term)]
    if book:
        data.append(("books[]", book))
    if page_no > 1:
        data += [("page", page_no), ("aqsam", "-1"), ("decades", "-1"), ("authors", "-1")]
        if not book:
            data.append(("books", "-1"))
    s = fetch("https://shamela.ws/ajax/search", data, {"X-Requested-With": "XMLHttpRequest"})
    shown = re.search(r'<div class="alert">([^<]*)</div>', s)
    print(shown.group(1) if shown else "no results")
    for art in re.findall(r'<article class="srch-result">(.*?)</article>', s, re.S):
        link = re.search(r'href="https://shamela.ws/book/(\d+)/(\d+)"', art)
        title = re.search(r'class="text-primaryy">([^<]*)<', art)
        author = re.search(r'class="text-gray">\[([^\]]*)\]', art)
        ref = re.search(r'srch-page-ref">([^<]*)<', art)
        snip = re.search(r'srch-snippet-text">(.*?)</span>\s*<button', art, re.S)
        print(f"\n{link.group(1)}/{link.group(2)}  {title.group(1) if title else ''} [{author.group(1) if author else ''}] {ref.group(1) if ref else ''}")
        print("   ", text(snip.group(1)) if snip else "")


def books(term):
    s = fetch("https://shamela.ws/ajax/books/?" + urllib.parse.urlencode({"term": term}))
    for item in json.loads(s).get("results", {}).get("items", []):
        if str(item.get("id")) != "-1":
            print(item["id"], item.get("text"))


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "search":
        opts = {}
        for flag in ("--page", "--book"):
            if flag in args:
                i = args.index(flag)
                opts[flag] = args[i + 1]
                args = args[:i] + args[i + 2 :]
        return search(" ".join(args[1:]), int(opts.get("--page", 1)), opts.get("--book"))
    if args[0] == "books":
        return books(" ".join(args[1:]))
    if len(args) < 2:
        sys.exit(__doc__)
    book, first = args[0], int(args[1])
    last = int(args[2]) if len(args) > 2 else first
    for n in range(first, last + 1):
        head, body = page(book, n)
        print(head)
        print(body)
        print()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
