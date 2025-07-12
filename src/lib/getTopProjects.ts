import { supabase, TopProject } from './supabase'

export interface GetTopProjectsOptions {
  limit?: number
  hours?: number
}

export interface TopProjectResult {
  projectId: string
  slug: string
  score: number
  deltaVsPrevPeriod: number | null
  name: string
  description: string | null
  githubStars: number | null
  githubForks: number | null
  npmDownloads: number | null
  redditMentions: number | null
}

/**
 * Get top projects by momentum score
 * @param options - Configuration options
 * @param options.limit - Number of projects to return (default: 50)
 * @param options.hours - Time window in hours (default: 24)
 * @returns Array of top projects sorted by momentum score
 */
export async function getTopProjects(
  options: GetTopProjectsOptions = {}
): Promise<TopProjectResult[]> {
  const { limit = 50, hours = 24 } = options

  // Return mock data if Supabase is not available
  if (!supabase) {
    return [
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
    ].slice(0, limit)
  }

  try {
    // Calculate the target date based on hours window
    const targetDate = new Date()
    targetDate.setHours(targetDate.getHours() - hours)
    // const dateString = targetDate.toISOString().split('T')[0]

    // Query the top_projects view for the most recent rankings
    const { data, error } = await supabase
      .from('top_projects')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top projects:', error)
      throw error
    }

    // Transform the data to match our interface
    return (data as TopProject[]).map(project => ({
      projectId: project.project_id,
      slug: project.project_id, // Using project_id as slug for now
      score: project.momentum_score,
      deltaVsPrevPeriod: project.delta_vs_prev,
      name: project.name,
      description: project.description,
      githubStars: project.github_stars,
      githubForks: project.github_forks,
      npmDownloads: project.npm_downloads,
      redditMentions: project.reddit_mentions,
    }))
  } catch (error) {
    console.error('Error in getTopProjects:', error)
    throw error
  }
}

/**
 * Get top projects for a specific date
 * @param date - Target date in YYYY-MM-DD format
 * @param limit - Number of projects to return
 * @returns Array of top projects for the specified date
 */
export async function getTopProjectsForDate(
  date: string,
  limit: number = 50
): Promise<TopProjectResult[]> {
  // Return empty array if Supabase is not available
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('daily_rankings')
      .select(`
        *,
        projects (
          name,
          description
        )
      `)
      .eq('date', date)
      .order('momentum_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top projects for date:', error)
      throw error
    }

    return data.map((ranking: { project_id: string; momentum_score: number; delta_vs_prev: number | null; projects?: { name?: string; description?: string | null }; github_stars?: number | null; github_forks?: number | null; npm_downloads?: number | null; reddit_mentions?: number | null }) => ({
      projectId: ranking.project_id,
      slug: ranking.project_id,
      score: ranking.momentum_score,
      deltaVsPrevPeriod: ranking.delta_vs_prev,
      name: ranking.projects?.name || ranking.project_id,
      description: ranking.projects?.description || null,
      githubStars: ranking.github_stars || null,
      githubForks: ranking.github_forks || null,
      npmDownloads: ranking.npm_downloads || null,
      redditMentions: ranking.reddit_mentions || null,
    }))
  } catch (error) {
    console.error('Error in getTopProjectsForDate:', error)
    throw error
  }
}

/**
 * Get project momentum history
 * @param projectId - The project ID to get history for
 * @param days - Number of days of history to retrieve
 * @returns Array of daily momentum scores
 */
export async function getProjectMomentumHistory(
  projectId: string,
  days: number = 30
): Promise<Array<{ date: string; score: number; delta: number | null }>> {
  // Return empty array if Supabase is not available
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('daily_rankings')
      .select('date, momentum_score, delta_vs_prev')
      .eq('project_id', projectId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching project momentum history:', error)
      throw error
    }

    return data.map((row: { date: string; momentum_score: number; delta_vs_prev: number | null }) => ({
      date: row.date,
      score: row.momentum_score,
      delta: row.delta_vs_prev,
    }))
  } catch (error) {
    console.error('Error in getProjectMomentumHistory:', error)
    throw error
  }
} 