import { Outlet } from '@remix-run/react';
import { LinksFunction } from '@remix-run/server-runtime';
import proseStylesheet from '~/styles/prose.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: proseStylesheet }];
};

export default function BlogLayout() {
  return (
    <article className="prose mx-auto py-20">
      <Outlet />
    </article>
  );
}
