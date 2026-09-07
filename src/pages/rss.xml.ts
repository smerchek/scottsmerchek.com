import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const sortedPosts = await getPublishedPosts();

  return rss({
    title: 'Scott Smerchek',
    description: 'Personal blog of Scott Smerchek. Web development, Remix, software craftsmanship, and technology.',
    site: context.site || 'https://scottsmerchek.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
