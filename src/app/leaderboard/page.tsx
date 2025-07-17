"use client";

import { Suspense } from 'react'
import Spark from '@/components/Spark'
import Delta from '@/components/Delta'
import LeaderboardSkeleton from '@/components/LeaderboardSkeleton'
import Logo from '@/components/Logo'
import { getTopProjects, getProjectHistory } from '@/lib/data'
import { useState } from 'react';

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata = {
  title: 'FluxRank.io – Live OSS Leaderboard',
  description: 'Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.',
}

function InfoBox() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 max-w-2xl mx-auto">
      <button
        className="flex items-center gap-2 text-sm text-brand-lime hover:underline focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-lg">ℹ️</span>
        <span>How are these scores calculated?</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="mt-3 p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-gray-300 shadow-lg">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Momentum Score:</b> A weighted combination of recent GitHub stars/forks (70%) and npm downloads (30%), normalized using z-scores to show which projects are gaining traction fastest.</li>
            <li><b>Change vs. Yesterday:</b> How much the momentum score has changed since the previous day.</li>
            <li><b>7-day Trend:</b> A sparkline showing the project’s momentum score over the past week.</li>
            <li className="text-brand-pink"><b>Reddit buzz will be included in the future!</b></li>
          </ul>
        </div>
      )}
    </div>
  );
}

async function LeaderboardTable() {
  const topProjects = await getTopProjects(20)

  return (
    <div className="bg-neutral-800 rounded-lg shadow-sm border border-neutral-700 overflow-hidden">
      <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-100">Top Projects by Momentum</h2>
        <p className="text-gray-400 text-sm">Last 24 hours • Updated every 5 minutes</p>
      </div>
      {/* Column labels */}
      <div className="flex px-6 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-neutral-700 bg-neutral-900">
        <div className="w-8 flex-shrink-0" />
        <div className="flex-1 min-w-0">Project</div>
        <div className="w-28 text-right">Momentum Score</div>
        <div className="w-24 text-right">Change vs. Yesterday</div>
        <div className="w-24 text-right">7-day Trend</div>
      </div>
      <div className="divide-y divide-neutral-700">
        {topProjects.map((project, index) => (
          <div key={project.project_id} className="px-6 py-4 hover:bg-neutral-900 transition-colors">
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
                      href={`/project/${project.project_id}`}
                      className="hover:text-brand-lime transition-colors"
                    >
                      {project.name || project.project_id}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {project.description || project.project_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-28 text-right">
                  <div className="text-lg font-semibold text-gray-100">
                    {project.momentum_score?.toFixed(1) || '0.0'}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <Delta delta={project.delta_vs_prev || 0} />
                </div>
                <div className="w-24">
                  <Suspense fallback={<div className="w-24 h-8 bg-neutral-900 rounded animate-pulse" />}>
                    <SparkWrapper projectId={project.project_id} />
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

async function SparkWrapper({ projectId }: { projectId: string }) {
  const history = await getProjectHistory(projectId, 7)
  
  const sparkData = history.map(item => ({
    date: item.date,
    score: item.momentum_score
  }))
  
  return <Spark data={sparkData} />
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
      {/* Info/legend area */}
      <InfoBox />
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardTable />
        </Suspense>
      </div>
    </div>
  )
} 