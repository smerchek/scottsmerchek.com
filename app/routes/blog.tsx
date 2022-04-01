import { Outlet } from '@remix-run/react';
import { LinksFunction } from '@remix-run/server-runtime';
import proseStylesheet from '~/styles/prose.css';
import prismLightStylesheet from '~/styles/prism-light.css';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: proseStylesheet },
    { rel: 'stylesheet', href: prismLightStylesheet },
  ];
};

export default function BlogLayout() {
  return (
    <article className="line-numbers prose mx-auto py-20">
      <Outlet />
    </article>
  );
}
