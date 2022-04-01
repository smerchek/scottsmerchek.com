import { json, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from 'remix';
import type { LinksFunction, MetaFunction, LoaderFunction } from 'remix';

import tailwindStylesheetUrl from './styles/tailwind.css';
import { getUser } from './session.server';
import Nav from './components/shared/Nav';
import { useHTMLBackgroundColor } from './utils/useBodyBackgroundColor';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'manifest', href: '/manifest.json' },
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Scott Smerchek',
  viewport: 'width=device-width,initial-scale=1',
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

export default function App() {
  const htmlBackgroundColor = useHTMLBackgroundColor() ?? 'bg-gray-50';

  return (
    <html lang="en" className={`h-full ${htmlBackgroundColor}`}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Nav />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
