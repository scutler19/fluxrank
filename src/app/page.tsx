import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'FluxRank – Real-time OSS Leaderboard',
  description: 'Spot tomorrow\'s breakout dev tools, today. Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.',
  openGraph: {
    title: 'FluxRank – Real-time OSS Leaderboard',
    description: 'Spot tomorrow\'s breakout dev tools, today. Real-time leaderboard of open source projects ranked by momentum.',
    type: 'website',
    url: 'https://fluxrank.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FluxRank – Real-time OSS Leaderboard',
    description: 'Spot tomorrow\'s breakout dev tools, today.',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-400">FluxRank.io</div>
          <a 
            href="/leaderboard" 
            className="text-gray-300 hover:text-white transition-colors"
          >
            View Leaderboard →
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Spot tomorrow&apos;s breakout dev tools,{' '}
          <span className="text-blue-400">today.</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.
        </p>

        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
                      <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="button"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
              Join Beta
            </button>
          </div>
          <div className="mt-2 text-gray-400 text-sm text-center">
            We&apos;ll notify you when FluxRank launches.
          </div>
        </div>

        {/* Feature Bullets */}
        <div className="mt-16 space-y-6">
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-400 text-lg">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Real-time Momentum</h3>
              <p className="text-gray-400">Track which projects are gaining traction right now, not just total popularity.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-400 text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Multi-Source Intelligence</h3>
              <p className="text-gray-400">Combines GitHub activity, npm downloads, and Reddit discussions for comprehensive insights.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-400 text-lg">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Early Detection</h3>
              <p className="text-gray-400">Discover promising projects before they become mainstream and get ahead of the curve.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Built by</span>
            <a 
              href="https://x.com/ExitCodeZer0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              @ExitCodeZer0
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
