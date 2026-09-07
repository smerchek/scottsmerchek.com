import { GET as getRss } from './rss.xml';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  return getRss(context);
}
