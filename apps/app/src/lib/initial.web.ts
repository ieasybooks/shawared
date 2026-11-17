import { useLoaderData, usePathname } from "expo-router";
import { useState } from "react";
import { addressOf } from "./loaderKey";

/** A route's loader, as far as its data goes. */
type Loader = (...args: never[]) => unknown;
type Data<L extends Loader> = NonNullable<Awaited<ReturnType<L>>>;

// Every web page is rendered ahead of time with its loader's data, and carries that data for
// the browser to wake the page with (hydration).
//
// Expo Router's `useLoaderData` also fetches a route's data whenever the app moves to another
// page, and suspends the page until it arrives: Expo shows nothing in the meantime, not even
// the page's header, so every move showed an empty screen for 0.3 to 3 seconds. The pages
// don't need it. They load their files themselves, through the content cache, which often
// has them already (the catalog behind every list, a poem opened before). So the browser
// reads only the data its first page came with, and pages it moves to start at once.

/** The loader data the page was rendered with, if this is the page the browser opened. */
function fromPage(pathname: string): unknown {
  const all = (globalThis as { __EXPO_ROUTER_LOADER_DATA__?: Record<string, unknown> }).__EXPO_ROUTER_LOADER_DATA__;
  if (!all) return undefined;
  const key = Object.keys(all).find((k) => addressOf(k) === pathname);
  return key === undefined ? undefined : (all[key] ?? undefined);
}

/** Rendering ahead of time: the loader's data, which Expo hands the page directly. */
function useRendered<L extends Loader>(): Data<L> | undefined {
  return (useLoaderData() as Awaited<ReturnType<L>> | null) ?? undefined;
}

/** In the browser: the data the first page came with, once; nothing for pages moved to. */
function useWoken<L extends Loader>(): Data<L> | undefined {
  const pathname = usePathname();
  const [data] = useState(() => fromPage(pathname));
  return data as Data<L> | undefined;
}

/**
 * The data a page was rendered with ahead of time, from its `loader`: for the page the browser
 * opened, so it wakes up as it was rendered. Pages moved to load their own.
 */
export const useInitial: <L extends Loader>() => Data<L> | undefined = typeof window === "undefined" ? useRendered : useWoken;
