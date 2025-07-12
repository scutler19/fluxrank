import { Suspense } from 'react'
import Spark from '@/components/Spark'
import Delta from '@/components/Delta'
import LeaderboardSkeleton from '@/components/LeaderboardSkeleton'
import Logo from '@/components/Logo'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata = {
  title: 'FluxRank.io – Live OSS Leaderboard',
  description: 'Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.',
}

// Mock data for testing the UI
const mockTopProjects = [
  {
    projectId: 'facebook/react',
    slug: 'facebook/react',
    score: 95.2,
    deltaVsPrevPeriod: 2.1,
    name: 'React',
    description: 'The library for web and native user interfaces',
    githubStars: 210000,
    githubForks: 44000,
    npmDownloads: 39743592,
    redditMentions: 1250,
  },
  {
    projectId: 'vercel/next.js',
    slug: 'vercel/next.js',
    score: 87.8,
    deltaVsPrevPeriod: -1.3,
    name: 'Next.js',
    description: 'The React Framework for Production',
    githubStars: 110000,
    githubForks: 24000,
    npmDownloads: 11150662,
    redditMentions: 890,
  },
  {
    projectId: 'supabase/supabase',
    slug: 'supabase/supabase',
    score: 82.4,
    deltaVsPrevPeriod: 5.7,
    name: 'Supabase',
    description: 'The open source Firebase alternative',
    githubStars: 65000,
    githubForks: 12000,
    npmDownloads: 303111,
    redditMentions: 450,
  },
  {
    projectId: 'vuejs/vue',
    slug: 'vuejs/vue',
    score: 78.9,
    deltaVsPrevPeriod: 0.8,
    name: 'Vue.js',
    description: 'The Progressive JavaScript Framework',
    githubStars: 205000,
    githubForks: 33000,
    npmDownloads: 8500000,
    redditMentions: 650,
  },
  {
    projectId: 'angular/angular',
    slug: 'angular/angular',
    score: 75.3,
    deltaVsPrevPeriod: -2.1,
    name: 'Angular',
    description: 'Deliver web apps with confidence',
    githubStars: 95000,
    githubForks: 25000,
    npmDownloads: 3200000,
    redditMentions: 320,
  },
]

async function LeaderboardTable() {
  // Use mock data for now
  const topProjects = mockTopProjects

  return (
    <div className="bg-neutral-800 rounded-lg shadow-sm border border-neutral-700 overflow-hidden">
      <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-100">Top Projects by Momentum</h2>
        <p className="text-gray-400 text-sm">Last 24 hours • Updated every 5 minutes</p>
      </div>
      
      <div className="divide-y divide-neutral-700">
        {topProjects.map((project, index) => (
          <div key={project.projectId} className="px-6 py-4 hover:bg-neutral-900 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-lime/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-lime">
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-100 truncate">
                    <a 
                      href={`/project/${project.slug}`}
                      className="hover:text-brand-lime transition-colors"
                    >
                      {project.name}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {project.description || project.projectId}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-100">
                    {project.score.toFixed(1)}
                  </div>
                  <Delta delta={project.deltaVsPrevPeriod} />
                </div>
                
                <div className="w-24">
                  <Suspense fallback={<div className="w-24 h-8 bg-neutral-900 rounded animate-pulse" />}>
                    <SparkWrapper />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {topProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No projects found. Rankings may not be calculated yet.</p>
        </div>
      )}
    </div>
  )
}

async function SparkWrapper() {
  // Mock sparkline data for testing
  const mockSparkData = [
    { date: '2025-07-05', score: 85 + Math.random() * 10 },
    { date: '2025-07-06', score: 87 + Math.random() * 10 },
    { date: '2025-07-07', score: 89 + Math.random() * 10 },
    { date: '2025-07-08', score: 91 + Math.random() * 10 },
    { date: '2025-07-09', score: 88 + Math.random() * 10 },
    { date: '2025-07-10', score: 92 + Math.random() * 10 },
    { date: '2025-07-11', score: 95 + Math.random() * 10 },
  ]
  
  return <Spark data={mockSparkData} />
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top bar */}
      <div className="bg-neutral-900 border-b border-neutral-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Logo width={180} height={40} />
              <p className="text-gray-400 mt-1">Live OSS Leaderboard</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>Real-time momentum tracking</div>
              <div>GitHub • npm • Reddit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardTable />
        </Suspense>
      </div>
    </div>
  )
} 