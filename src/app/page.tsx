import { Metadata } from 'next'
import Logo from '@/components/Logo'
import EmailForm from '@/components/EmailForm'
import { TrendingUp, BarChart2, Radar, ArrowRight } from 'lucide-react';

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'FluxRank.io – Real-time OSS Leaderboard',
  description: 'Spot tomorrow\'s breakout dev tools, today. Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.',
  openGraph: {
    title: 'FluxRank.io – Real-time OSS Leaderboard',
    description: 'Spot tomorrow\'s breakout dev tools, today. Real-time leaderboard of open source projects ranked by momentum.',
    type: 'website',
    url: 'https://fluxrank.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FluxRank.io – Real-time OSS Leaderboard',
    description: 'Spot tomorrow\'s breakout dev tools, today.',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      {/* Header */}
      <header className="border-b border-neutral-700/50">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <Logo width={160} height={35} />
          <a 
            href="/leaderboard" 
            className="text-gray-400 hover:text-gray-200 transition-colors font-medium flex items-center gap-2 group"
          >
            <span>View Leaderboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-lime/10 border border-brand-lime/20 rounded-full text-brand-lime text-sm font-medium mb-8">
          <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse flex-shrink-0"></div>
          <span className="text-center">Coming Soon - Join the Beta</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
          Spot tomorrow&apos;s breakout dev tools,{' '}
          <span className="text-brand-lime bg-gradient-to-r from-brand-lime to-brand-limeLight bg-clip-text text-transparent">today.</span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
          Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.
        </p>

        {/* CTA Section */}
        <div className="mb-16 sm:mb-20">
          <EmailForm />
        </div>

        {/* Feature Bullets */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16 sm:mb-20">
          <div className="text-center group">
            <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-lime/20 transition-colors">
              <TrendingUp className="w-8 h-8 text-brand-lime" />
            </div>
            <h3 className="font-bold text-gray-100 mb-3 text-lg">Real-time Momentum</h3>
            <p className="text-gray-400 leading-relaxed">Track which projects are gaining traction right now, not just total popularity.</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-pink/20 transition-colors">
              <BarChart2 className="w-8 h-8 text-brand-pink" />
            </div>
            <h3 className="font-bold text-gray-100 mb-3 text-lg">Multi-Source Intelligence</h3>
            <p className="text-gray-400 leading-relaxed">Combines GitHub activity, npm downloads, and Reddit discussions for comprehensive insights.</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-lime/20 transition-colors">
              <Radar className="w-8 h-8 text-brand-lime" />
            </div>
            <h3 className="font-bold text-gray-100 mb-3 text-lg">Early Detection</h3>
            <p className="text-gray-400 leading-relaxed">Discover promising projects before they become mainstream and get ahead of the curve.</p>
          </div>
        </div>

        {/* Preview CTA */}
        <div className="p-8 sm:p-10 bg-neutral-800/30 rounded-2xl border border-neutral-700/50 max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-4">Want to see it in action?</h3>
          <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg">Check out our live leaderboard with real data from popular open source projects.</p>
          <a 
            href="/leaderboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-lime hover:bg-brand-limeLight text-gray-200 font-medium rounded-xl transition-colors"
          >
            <span>View Live Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-700/50 mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Built by</span>
            <a 
              href="https://x.com/ExitCodeZer0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-lime hover:text-brand-limeLight transition-colors font-medium"
            >
              @ExitCodeZer0
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
