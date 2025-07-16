import { supabase, TopProject } from './supabase'

export async function getTopProjects(limit: number = 20): Promise<TopProject[]> {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('top_projects')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching top projects:', error)
    return []
  }
}

export async function getProjectHistory(projectId: string, days: number = 7): Promise<Array<{date: string, momentum_score: number}>> {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('daily_rankings')
      .select('date, momentum_score')
      .eq('project_id', projectId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching project history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching project history:', error)
    return []
  }
}

export async function getProjectDetails(projectId: string): Promise<TopProject | null> {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('top_projects')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project details:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching project details:', error)
    return null
  }
} 