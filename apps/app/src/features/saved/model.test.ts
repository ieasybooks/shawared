import { describe, expect, it } from "vitest";
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
  present,
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
    expect(playlistOf(movePoem(withList, "l1", 2, 0), "l1")?.poems).toEqual(["c", "a", "b"]);
    expect(playlistOf(movePoem(withList, "l1", 0, 1), "l1")?.poems).toEqual(["b", "a", "c"]);
    expect(movePoem(withList, "l1", 0, 3)).toEqual(withList);
    expect(movePoem(withList, "l1", -1, 0)).toEqual(withList);
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
    expect(newPlaylistId(0, 0)).toBe("00000");
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

  it("drops poems the catalog no longer has", () => {
    expect(present(["a", "gone", "b"], (id) => id !== "gone")).toEqual(["a", "b"]);
  });
});
