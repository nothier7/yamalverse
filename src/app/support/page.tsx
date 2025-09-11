export const metadata = {
  title: 'Support Yamalverse 💜',
  description: 'Support Yamalverse and help it grow.',
};

export default function SupportPage() {
  return (
    <main className="px-4 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 shadow-md backdrop-blur-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Yamalverse 💜</h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-300">
            Yamalverse is an independent fan project tracking Lamine Yamals journey with detailed stats, records, and visuals.
          </p>

          <p className="mt-3 text-sm sm:text-base text-neutral-300">
            The site is free and ad-free, but hosting and building new features take time and resources.
          </p>

          <p className="mt-3 text-sm sm:text-base text-neutral-300">
            If you enjoy Yamalverse and want to support its growth, you can{' '}
            <a href="https://www.buymeacoffee.com/yamalverse" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white">
              Buy Me a Coffee
            </a>
            . Every contribution helps keep the project alive and improving.
          </p>

          <p className="mt-3 text-sm sm:text-base text-neutral-300">
            👉 In the future, supporters may also get early access to new features and a shout-out on our Supporters Wall.
          </p>

          <div className="mt-6">
            <a
              href="https://www.buymeacoffee.com/yamalverse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy Me a Coffee for Yamalverse"
              className="inline-block"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                style={{ height: '45px', width: '162px' }}
                loading="lazy"
              />
            </a>
          </div>

          <p className="mt-6 text-sm text-neutral-300">
            Thank you for being part of the Yamalverse community! 💜
          </p>
        </div>
      </div>
    </main>
  );
}
