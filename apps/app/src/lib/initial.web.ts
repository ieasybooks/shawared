import { useLoaderData } from "expo-router";

/** A route's loader, as far as its data goes. */
type Loader = (...args: never[]) => unknown;

/**
 * The data a page was rendered with ahead of time, from its `loader`: in the page itself on
 * first load, fetched with the page when navigating.
 */
export function useInitial<L extends Loader>(): NonNullable<Awaited<ReturnType<L>>> | undefined {
  return (useLoaderData() as Awaited<ReturnType<L>> | null) ?? undefined;
}
