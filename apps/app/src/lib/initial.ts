/** A route's loader, as far as its data goes. */
type Loader = (...args: never[]) => unknown;

/**
 * The data a page was rendered with ahead of time, from its `loader`. Only web pages are
 * rendered ahead of time; the apps load everything themselves.
 */
export function useInitial<L extends Loader>(): NonNullable<Awaited<ReturnType<L>>> | undefined {
  return undefined;
}
