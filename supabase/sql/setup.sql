-- supabase/sql/setup.sql
-- Database schema for FluxRank

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create snapshots table
CREATE TABLE IF NOT EXISTS snapshots (
    id BIGSERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id),
    src TEXT NOT NULL,
    stars INTEGER,
    forks INTEGER,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_snapshots_project_id ON snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_src ON snapshots(src);
CREATE INDEX IF NOT EXISTS idx_snapshots_captured_at ON snapshots(captured_at);

-- Insert some sample projects for testing
INSERT INTO projects (project_id, name, description) VALUES 
    ('supabase/supabase', 'Supabase', 'The open source Firebase alternative'),
    ('vercel/next.js', 'Next.js', 'The React Framework for Production'),
    ('facebook/react', 'React', 'The library for web and native user interfaces')
ON CONFLICT (project_id) DO NOTHING; 