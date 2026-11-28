import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Saved } from "./model";

const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: storage }));
vi.mock("react-native", () => ({ Platform: { OS: "web" } }));
vi.mock("../player/player", () => ({ player: {} }));
vi.mock("../../lib/content", () => ({ catalogNow: () => undefined }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetModules();
  storage.getItem.mockReset().mockResolvedValue(null);
  storage.setItem.mockReset().mockResolvedValue(undefined);
});

describe("saved mutations", () => {
  it("waits for restoration and earlier writes before completing playlist creation", async () => {
    const restored = deferred<string>();
    const firstWrite = deferred<void>();
    const firstStarted = deferred<void>();
    const secondWrite = deferred<void>();
    const secondStarted = deferred<void>();
    storage.getItem.mockReturnValue(restored.promise);
    storage.setItem
      .mockImplementationOnce(() => {
        firstStarted.resolve();
        return firstWrite.promise;
      })
      .mockImplementationOnce(() => {
        secondStarted.resolve();
        return secondWrite.promise;
      });
    const { newPlaylist, toggleFav } = await import("./actions");
    const { updateSaved, SAVED_KEY } = await import("./storage");
    const first = toggleFav("poems", "new");
    let completed = false;
    const created = newPlaylist("  evening  ", ["new"]).then((id) => {
      completed = true;
      return id;
    });
    expect(storage.setItem).not.toHaveBeenCalled();

    restored.resolve(JSON.stringify({ poems: ["kept"], poets: [], reciters: [], playlists: [] }));
    await firstStarted.promise;
    expect(completed).toBe(false);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.setItem.mock.calls[0]![1])).toMatchObject({ poems: ["new", "kept"], playlists: [] });
    firstWrite.resolve();
    await first;
    await secondStarted.promise;
    expect(completed).toBe(false);
    expect(storage.setItem.mock.calls[1]![0]).toBe(SAVED_KEY);
    secondWrite.resolve();
    const id = await created;
    let current: Saved | undefined;
    await updateSaved((saved) => {
      current = saved;
      return saved;
    });
    expect(current).toMatchObject({ poems: ["new", "kept"], playlists: [{ id, name: "evening", poems: ["new"] }] });
    expect(storage.getItem).toHaveBeenCalledOnce();
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  it("keeps an in-memory change after a failed write and lets the next save proceed", async () => {
    storage.setItem.mockRejectedValueOnce(new Error("disk full"));
    const { toggleFav, newPlaylist } = await import("./actions");
    const { updateSaved } = await import("./storage");
    await toggleFav("poems", "kept");
    const id = await newPlaylist("", ["kept"]);
    let current: Saved | undefined;
    await updateSaved((saved) => {
      current = saved;
      return saved;
    });
    expect(current).toMatchObject({ poems: ["kept"], playlists: [{ id, name: "", poems: ["kept"] }] });
    expect(JSON.parse(storage.setItem.mock.calls[1]![1])).toEqual(current);
  });
});
