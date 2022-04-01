/* This example requires Tailwind CSS v2.0+ */
import { Link, NavLink } from 'remix';

const navigation = [
  { name: 'Home', href: '/', end: true },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Nav() {
  return (
    <>
      <nav className="bg-gray-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/">
                  <span className="text-lg text-gray-800">
                    Scott <span className="hidden sm:inline-block">Smerchek</span>
                  </span>
                </Link>
              </div>
              <div className="-my-px ml-6 flex space-x-8">
                {navigation.map(item => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.end}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
