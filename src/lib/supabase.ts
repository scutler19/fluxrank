import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for our database schema
export interface Project {
  project_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface DailyRanking {
  id: number
  project_id: string
  date: string
  github_stars: number | null
  github_forks: number | null
  npm_downloads: number | null
  reddit_mentions: number | null
  github_z_score: number | null
  npm_z_score: number | null
  reddit_z_score: number | null
  momentum_score: number
  prev_score: number | null
  delta_vs_prev: number | null
  created_at: string
  updated_at: string
}

export interface TopProject {
  project_id: string
  name: string
  description: string | null
  date: string
  momentum_score: number
  delta_vs_prev: number | null
  github_stars: number | null
  github_forks: number | null
  npm_downloads: number | null
  reddit_mentions: number | null
  github_z_score: number | null
  npm_z_score: number | null
  reddit_z_score: number | null
} 