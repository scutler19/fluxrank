// Twitter API helper functions
// Note: We'll use dynamic imports to avoid SSR issues with the Twitter API library

/**
 * Create Twitter client with OAuth 1.0a credentials
 */
async function createTwitterClient() {
  const { TwitterApi } = await import('twitter-api-v2')

  const appKey = process.env.TW_CONSUMER_KEY
  const appSecret = process.env.TW_CONSUMER_SECRET
  const accessToken = process.env.TW_ACCESS_TOKEN
  const accessSecret = process.env.TW_ACCESS_SECRET

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error('Missing Twitter API credentials in environment variables')
  }

  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  })
}

/**
 * Post a tweet with retry logic
 * @param text - The tweet text (must be ≤ 280 characters)
 * @returns Promise with tweet result
 */
export async function postTweet(text: string): Promise<{ id: string; text: string }> {
  if (!text || text.length > 280) {
    throw new Error(`Invalid tweet text: ${text.length} characters (max 280)`)
  }

  try {
    console.log(`Posting tweet: ${text}`)
    const client = await createTwitterClient()
    const tweet = await client.v2.tweet(text)
    console.log(`Tweet posted successfully: ${tweet.data.id}`)
    return {
      id: tweet.data.id,
      text: tweet.data.text,
    }
  } catch (error: unknown) {
    console.error('Twitter API error:', error)

    // Retry once for rate limits or server errors
    if ((error as any).code === 429 || (error as any).code === 503) {
      console.log('Rate limit or server error, retrying in 30 seconds...')
      await new Promise(resolve => setTimeout(resolve, 30000))

      try {
        console.log(`Retrying tweet: ${text}`)
        const client = await createTwitterClient()
        const tweet = await client.v2.tweet(text)
        console.log(`Tweet posted successfully on retry: ${tweet.data.id}`)
        return {
          id: tweet.data.id,
          text: tweet.data.text,
        }
      } catch (retryError: unknown) {
        console.error('Twitter API retry error:', retryError)
        throw new Error(`Failed to post tweet after retry: ${(retryError as Error).message}`)
      }
    }

    throw new Error(`Failed to post tweet: ${(error as Error).message}`)
  }
}

/**
 * Format delta value for display (up arrow, down arrow, no emojis)
 * @param delta - The delta value
 * @returns Formatted string with sign and arrow
 */
export function formatDelta(delta: number | null): string {
  if (delta === null || delta === 0) return '0'

  const sign = delta > 0 ? '+' : ''
  // Unicode: up arrow (U+2191), down arrow (U+2193)
  const upArrow = '↑'
  const downArrow = '↓'
  return delta > 0
    ? `${upArrow}${sign}${delta.toFixed(1)}`
    : `${downArrow}${delta.toFixed(1)}`
}

/**
 * Build tweet text from top movers data
 * @param projects - Array of top projects with delta data
 * @returns Formatted tweet text
 */
export function buildMoversTweet(projects: Array<{ slug: string; deltaVsPrevPeriod: number | null }>): string {
  const validProjects = projects.filter(p => p.deltaVsPrevPeriod !== null)

  if (validProjects.length === 0) {
    return "Top OSS Movers (24h): No significant movers today. See more at https://FluxRank.io"
  }

  let tweet = "Top OSS Movers (24h):\n\n"

  validProjects.slice(0, 3).forEach((project, index) => {
    const delta = formatDelta(project.deltaVsPrevPeriod)
    const slug = project.slug.includes('/') ? project.slug.split('/')[1] : project.slug
    tweet += `${index + 1}. ${slug} ${delta}\n`
  })

  tweet += "\nSee more at https://FluxRank.io"

  // Ensure tweet is within limit
  if (tweet.length > 280) {
    // Truncate and add ellipsis
    tweet = tweet.substring(0, 277) + "..."
  }

  return tweet
} 