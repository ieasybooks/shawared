import { describe, expect, it } from "vitest";
import type { Catalog } from "@shawared/contracts";
import {
  addToPlaylist,
  cleanName,
  createPlaylist,
  deletePlaylist,
  EMPTY,
  isFavourite,
  movePoem,
  NAME_MAX,
  newPlaylistId,
  parseSaved,
  playlistOf,
  playlistContent,
  removeFromPlaylist,
  renamePlaylist,
  toggleFavourite,
  togglePoemInPlaylist,
  type Saved,
} from "./model";

const withList: Saved = createPlaylist(EMPTY, "l1", "مساء", ["a", "b", "c"]);

describe("favourites", () => {
  it("adds to the front and takes out again", () => {
    let s = toggleFavourite(EMPTY, "poems", "a");
    s = toggleFavourite(s, "poems", "b");
    expect(s.poems).toEqual(["b", "a"]);
    expect(isFavourite(s, "poems", "a")).toBe(true);
    s = toggleFavourite(s, "poems", "a");
    expect(s.poems).toEqual(["b"]);
    expect(isFavourite(s, "poems", "a")).toBe(false);
  });

  it("keeps poems, poets and reciters apart", () => {
    const s = toggleFavourite(toggleFavourite(EMPTY, "poets", "x"), "reciters", "x");
    expect(s.poets).toEqual(["x"]);
    expect(s.reciters).toEqual(["x"]);
    expect(isFavourite(s, "poems", "x")).toBe(false);
  });
});

describe("playlists", () => {
  it("are created at the top, without repeated poems", () => {
    const s = createPlaylist(withList, "l2", "  صباح   الخير ", ["d", "d", "e"]);
    expect(s.playlists.map((p) => p.id)).toEqual(["l2", "l1"]);
    expect(playlistOf(s, "l2")).toEqual({ id: "l2", name: "صباح الخير", poems: ["d", "e"] });
    // An id already used changes nothing.
    expect(createPlaylist(s, "l1", "other")).toBe(s);
  });

  it("take a poem once, at the end, and let it go", () => {
    let s = addToPlaylist(withList, "l1", "d");
    s = addToPlaylist(s, "l1", "a");
    expect(playlistOf(s, "l1")?.poems).toEqual(["a", "b", "c", "d"]);
    s = removeFromPlaylist(s, "l1", "b");
    expect(playlistOf(s, "l1")?.poems).toEqual(["a", "c", "d"]);
    s = togglePoemInPlaylist(s, "l1", "c");
    s = togglePoemInPlaylist(s, "l1", "z");
    expect(playlistOf(s, "l1")?.poems).toEqual(["a", "d", "z"]);
  });

  it("move a poem up and down, and ignore moves out of range", () => {
    expect(playlistOf(movePoem(withList, "l1", "c", "a"), "l1")?.poems).toEqual(["c", "a", "b"]);
    expect(playlistOf(movePoem(withList, "l1", "a", "b"), "l1")?.poems).toEqual(["b", "a", "c"]);
    expect(movePoem(withList, "l1", "a", undefined)).toEqual(withList);
    expect(movePoem(withList, "l1", "missing", "a")).toEqual(withList);
  });

  it("are renamed and deleted; an unknown id changes nothing", () => {
    expect(playlistOf(renamePlaylist(withList, "l1", "ليل"), "l1")?.name).toBe("ليل");
    expect(deletePlaylist(withList, "l1").playlists).toEqual([]);
    expect(addToPlaylist(withList, "nope", "a")).toBe(withList);
    expect(renamePlaylist(withList, "nope", "x")).toBe(withList);
  });
});

describe("names and ids", () => {
  it("trims names to NAME_MAX characters", () => {
    expect(cleanName("  a \n b  ")).toBe("a b");
    expect([...cleanName("ق".repeat(NAME_MAX + 10))].length).toBe(NAME_MAX);
  });

  it("makes short ids that differ", () => {
    expect(newPlaylistId(0, 0)).not.toBe("");
    expect(newPlaylistId(1, 0)).not.toBe(newPlaylistId(0, 0));
    expect(newPlaylistId(1_700_000_000_000, 0.5)).not.toBe(newPlaylistId(1_700_000_000_000, 0.25));
  });
});

describe("reading what was stored", () => {
  it("keeps what it can of a damaged copy", () => {
    expect(parseSaved(null)).toEqual(EMPTY);
    expect(parseSaved("oops")).toEqual(EMPTY);
    expect(
      parseSaved({
        poems: ["a", 3, "a", "", "b"],
        poets: "x",
        playlists: [{ id: "l", name: 5, poems: ["a", null] }, { id: "l" }, { name: "no id" }, null],
      }),
    ).toEqual({ poems: ["a", "b"], poets: [], reciters: [], playlists: [{ id: "l", name: "", poems: ["a"] }] });
  });

  it("projects current poems in saved order, including their duration", () => {
    const catalog = {
      poems: [
        { id: "a", recitations: [{ duration: 10 }] },
        { id: "b", recitations: [{ duration: 20 }] },
      ],
    } as Catalog;
    const playlist = { id: "l", name: "", poems: ["gone", "b", "a"] };
    expect(playlistContent(playlist, catalog)).toEqual({ poems: [catalog.poems[1], catalog.poems[0]], ids: ["b", "a"], seconds: 30 });
    expect(playlist.poems).toEqual(["gone", "b", "a"]);
  });

  it.each([
    ["gone", "a", "b", "c"],
    ["a", "gone", "b", "c"],
    ["a", "b", "gone", "c"],
    ["a", "b", "c", "gone"],
  ])("moves visible identities around withdrawn poems in %j", (...poems) => {
    const saved = createPlaylist(EMPTY, "l", "", poems);
    const catalog = { poems: ["a", "b", "c"].map((id) => ({ id, recitations: [] })) } as unknown as Catalog;
    const moved = movePoem(saved, "l", "b", "a");
    expect(playlistContent(playlistOf(moved, "l")!, catalog).ids).toEqual(["b", "a", "c"]);
    expect(playlistOf(moved, "l")!.poems).toContain("gone");
    const down = movePoem(moved, "l", "b", "c");
    expect(playlistContent(playlistOf(down, "l")!, catalog).ids).toEqual(["a", "c", "b"]);
    expect(playlistOf(down, "l")!.poems).toContain("gone");
  });
});
