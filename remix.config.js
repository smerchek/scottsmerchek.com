/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
  mdx: async () => {
    const rehypeSlug = await import('rehype-slug');
    const remarkPrism = await import('remark-prism');

    return {
      remarkPlugins: [
        [
          remarkPrism.default,
          {
            plugins: [
              'prismjs/plugins/diff-highlight/prism-diff-highlight',
              'prismjs/plugins/line-numbers/prism-line-numbers',
            ],
          },
        ],
      ],
      rehypePlugins: [rehypeSlug.default],
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
