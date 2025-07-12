import { NextResponse } from 'next/server'
import { getTopProjects } from '@/lib/getTopProjects'
import { postTweet, buildMoversTweet } from '@/lib/twitter'

export async function GET() {
  try {
    console.log('Daily movers tweet worker started')

    // Get top 3 projects with 24-hour delta
    const projects = await getTopProjects({ limit: 3, hours: 24 })

    if (!projects || projects.length === 0) {
      console.log('No projects found for tweet')
      return NextResponse.json({
        error: 'No projects found'
      }, { status: 404 })
    }

    console.log(`Found ${projects.length} projects for tweet`)

    // Build the tweet text
    const tweetText = buildMoversTweet(projects)
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
        slug: p.slug,
        delta: p.deltaVsPrevPeriod,
        score: p.score
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