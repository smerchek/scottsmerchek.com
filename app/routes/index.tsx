export default function Index() {
  return (
    <>
      <div className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-y-0 block h-full w-full" aria-hidden="true">
          <div className="relative mx-auto h-full max-w-7xl">
            <svg
              className="absolute right-full translate-y-1/4 translate-x-1/4 transform lg:translate-x-1/2"
              width={404}
              height={784}
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect width={404} height={784} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
            </svg>
            <svg
              className="absolute left-full -translate-y-3/4 -translate-x-1/4 transform md:-translate-y-1/2 lg:-translate-x-1/2"
              width={404}
              height={784}
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect width={404} height={784} fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <main className="mx-auto mt-8 max-w-7xl px-4 sm:mt-24">
            <div className="flex flex-col items-center sm:flex-row">
              <img
                src="/images/profile.jpg"
                alt="head shot of Scott"
                className="inline-block h-40 w-40  rounded-full md:h-96 md:w-96"
              />
              <div className="mt-5 text-center sm:mt-0 sm:ml-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Hi, I'm </span>{' '}
                  <span className="block text-blue-600 xl:inline">Scott</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-left text-base leading-7 text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-center md:text-xl">
                  I build{' '}
                  <a
                    className="border-b-4 border-[#F17125] pb-1"
                    href="https://udisc.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    things
                  </a>{' '}
                  for the web, mostly with{' '}
                  <a
                    href="https://remix.run"
                    className="border-b-4 border-[#d83bd2] pb-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Remix
                  </a>
                  .
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
