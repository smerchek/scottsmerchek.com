import { LoaderFunction, redirect } from 'remix';

// Redirect for old blog -> new blog
export const loader: LoaderFunction = ({ params }) => {
  const { slug } = params;

  return redirect(`/blog/${slug}`, { status: 301 });
};
