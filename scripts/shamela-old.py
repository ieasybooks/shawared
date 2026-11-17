# /// script
# requires-python = ">=3.12"
# dependencies = ["libarchive-c", "access-parser"]
# ///
"""Reads a book from old.shamela.ws, where many diwans still are that the current site
lacks: downloads its archive, opens the Access database inside and writes the text.

    uv run -q scripts/shamela-old.py list [<word>]
    uv run -q scripts/shamela-old.py <book-id> > media/research/<poem>/<name>.txt

`list` prints the poetry shelf (category 406) with ids. The text comes one page to a block,
headed by the page number, in the database's own encoding (cp1256) turned into UTF-8.
Most of these diwans come from the Abu Dhabi poetry encyclopedia (each poem headed
«البحر : …»), so they count as one source, not an edition.
"""
import os, re, sys, tempfile, urllib.request

import libarchive
from access_parser import AccessParser

BASE = "https://old.shamela.ws"
UA = {"User-Agent": "Mozilla/5.0"}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()


def shelf(word=""):
    page = 1
    while True:
        url = f"{BASE}/rep.php/category/406" + (f"/page-{page}" if page > 1 else "")
        s = get(url).decode("utf-8", "replace")
        found = re.findall(r'rep.php/book/(\d+)"[^>]*>([^<]+)', s)
        for book, title in dict(found).items():
            if word in title:
                print(book, title.strip())
        if f"page-{page + 1}" not in s:
            break
        page += 1


def decode(value):
    if not isinstance(value, str):
        return value
    try:
        return value.encode("latin-1").decode("cp1256")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value


def book(book_id):
    page = get(f"{BASE}/rep.php/book/{book_id}").decode("utf-8", "replace")
    link = re.search(r'href="(/files/repository/[^"]+\.rar)"', page)
    if not link:
        sys.exit(f"no download on {BASE}/rep.php/book/{book_id}")
    with tempfile.TemporaryDirectory() as tmp:
        rar = os.path.join(tmp, "book.rar")
        with open(rar, "wb") as f:
            f.write(get(BASE + link.group(1)))
        bok = None
        with libarchive.file_reader(rar) as archive:
            for entry in archive:
                if entry.pathname.lower().endswith((".bok", ".mdb")):
                    bok = os.path.join(tmp, "book.bok")
                    with open(bok, "wb") as f:
                        for block in entry.get_blocks():
                            f.write(block)
        if not bok:
            sys.exit("no database in the archive")
        db = AccessParser(bok)
        main = db.parse_table("Main")
        print(f"=== old.shamela {book_id}: {decode(main['Bk'][0])}")
        print(decode(main["Betaka"][0]).replace("\r", ""))
        table = next(t for t in db.catalog if re.fullmatch(r"b\d+", t))
        rows = db.parse_table(table)
        order = sorted(range(len(rows["id"])), key=lambda i: rows["id"][i])
        for i in order:
            print(f"\n=== page {rows['page'][i]} (part {rows['part'][i]})")
            print(decode(rows["nass"][i]).replace("\r", "").strip())


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "list":
        return shelf(" ".join(args[1:]))
    book(args[0])


if __name__ == "__main__":
    main()
