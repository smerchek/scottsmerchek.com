/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
  mdx: async () => {
    const rehypeSlug = await import('rehype-slug');
    const rehypePrism = await import('rehype-prism-plus');
    const remarkGfm = await import('remark-gfm');

    return {
      remarkPlugins: [remarkGfm.default],
      rehypePlugins: [rehypeSlug.default, rehypePrism.default],
    };
  },
};

// exports.mdx = async filename => {
//   const [remarkCodeBlocksShiki] = await Promise.all([
//     import('@kentcdodds/md-temp').then(mod => mod.remarkCodeBlocksShiki),
//   ]);

//   return {
//     remarkPlugins: [remarkCodeBlocksShiki],
//   };
// };

// exports.mdx = async filename => {
//   const [mdxPrism] = await Promise.all([import('mdx-prism').then(mod => mod.default)]);

//   return {
//     rehypePlugins: [mdxPrism()],
//   };
// };
