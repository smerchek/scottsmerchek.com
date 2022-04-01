import { Outlet } from '@remix-run/react';
import { LinksFunction } from '@remix-run/server-runtime';
import proseStylesheet from '~/styles/prose.css';
import prismLightStylesheet from '~/styles/prism-light.css';
import { HandleHTMLBackgroundColor } from '~/utils/useBodyBackgroundColor';

export const handle: HandleHTMLBackgroundColor = {
  htmlBackgroundColor: 'bg-white',
};

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: proseStylesheet },
    { rel: 'stylesheet', href: prismLightStylesheet },
  ];
};

export default function BlogLayout() {
  return (
    <>
      <article className="prose mx-auto px-4 py-20">
        <Outlet />
      </article>
    </>
  );
}
