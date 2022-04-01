import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from 'remix';
import type { LinksFunction, MetaFunction } from 'remix';

import tailwindStylesheetUrl from './styles/tailwind.css';
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
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}
