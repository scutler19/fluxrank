import { NextResponse } from 'next/server'
import { getTopProjects } from '@/lib/data'
import { postTweet, buildMoversTweet } from '@/lib/twitter'

export async function GET() {
  try {
    console.log('Daily movers tweet worker started')

    // Get top 3 projects
    const projects = await getTopProjects(3)

    if (!projects || projects.length === 0) {
      console.log('No projects found for tweet')
      return NextResponse.json({
        error: 'No projects found'
      }, { status: 404 })
    }

    console.log(`Found ${projects.length} projects for tweet`)

    // Transform data for tweet building
    const tweetData = projects.map(p => ({
      slug: p.project_id,
      deltaVsPrevPeriod: p.delta_vs_prev || 0,
      score: p.momentum_score || 0
    }))

    // Build the tweet text
    const tweetText = buildMoversTweet(tweetData)
    console.log(`Tweet text: ${tweetText}`)

    // Actually post to Twitter
    const tweetResult = await postTweet(tweetText)

    const result = {
      ok: true,
      tweetedAt: new Date().toISOString(),
      tweetId: tweetResult.id,
      tweetText: tweetResult.text,
      projectsCount: projects.length,
      projects: projects.map(p => ({
        slug: p.project_id,
        delta: p.delta_vs_prev || 0,
        score: p.momentum_score || 0
      }))
    }

    console.log('Daily movers tweet posted successfully:', result)
    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error('Error in daily movers tweet worker:', error)

    return NextResponse.json({
      error: (error as Error).message || 'Unknown error occurred',
      tweetedAt: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle POST requests as well (for manual triggering)
export async function POST() {
  return GET()
} 