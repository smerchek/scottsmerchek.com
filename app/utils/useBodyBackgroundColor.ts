import { useMatches } from '@remix-run/react';

/**
 * A convenience type for `export const handle =` to ensure the correct `handle` structure is used.
 *
 * @example
 * // This route requires a gray background
 * export const handle: HandleHTMLBackgroundColor = {
 *    bodyBackgroundColor: "bg-gray-50"
 * };
 */
export type HandleHTMLBackgroundColor = {
  htmlBackgroundColor: string;
};

function isHandleHTMLBackgroundColor(handle: unknown): handle is HandleHTMLBackgroundColor {
  return (
    handle !== undefined &&
    handle !== null &&
    !Array.isArray(handle) &&
    (handle as HandleHTMLBackgroundColor).htmlBackgroundColor !== undefined &&
    typeof (handle as HandleHTMLBackgroundColor).htmlBackgroundColor === 'string'
  );
}

/**
 * Determine if at least one of the routes is asking to use a different
 * background color.
 *
 * To change the background color on the root <html> tag, the route must export a handle with an object,
 * this object must contain a string property named `htmlBackgroundColor`.
 * @example
 * // This route needs to load JS
 * export let handle = { htmlBackgroundColor: 'bg-gray-50' };
 */
export function useHTMLBackgroundColor() {
  return useMatches()
    .map(match => {
      if (!match.handle) {
        return false;
      }

      const { handle } = match;

      // handle must be an object to continue
      if (!isHandleHTMLBackgroundColor(handle)) {
        return false;
      }

      return handle.htmlBackgroundColor;
    })
    .filter(Boolean)
    .at(-1);
}
