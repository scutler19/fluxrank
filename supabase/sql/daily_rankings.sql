-- Daily momentum rankings system
-- This creates a materialized view that calculates daily momentum scores
-- based on the most recent snapshots from GitHub, npm, and Reddit

-- Create the daily_rankings table to store calculated scores
CREATE TABLE IF NOT EXISTS daily_rankings (
    id BIGSERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id),
    date DATE NOT NULL,
    github_stars INTEGER,
    github_forks INTEGER,
    npm_downloads INTEGER,
    reddit_mentions INTEGER,
    github_z_score NUMERIC(10, 4),
    npm_z_score NUMERIC(10, 4),
    reddit_z_score NUMERIC(10, 4),
    momentum_score NUMERIC(10, 4) NOT NULL,
    prev_score NUMERIC(10, 4),
    delta_vs_prev NUMERIC(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_rankings_date ON daily_rankings(date);
CREATE INDEX IF NOT EXISTS idx_daily_rankings_score ON daily_rankings(momentum_score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_rankings_project_date ON daily_rankings(project_id, date DESC);

-- Function to calculate z-scores for a given date
CREATE OR REPLACE FUNCTION calculate_z_scores(target_date DATE)
RETURNS TABLE (
    project_id TEXT,
    github_z_score NUMERIC(10, 4),
    npm_z_score NUMERIC(10, 4),
    reddit_z_score NUMERIC(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    WITH github_stats AS (
        SELECT 
            s.project_id,
            s.stars,
            AVG(s.stars) OVER () as avg_stars,
            STDDEV(s.stars) OVER () as std_stars
        FROM snapshots s
        WHERE s.src = 'github' 
        AND DATE(s.captured_at) = target_date
        AND s.stars IS NOT NULL
    ),
    npm_stats AS (
        SELECT 
            s.project_id,
            s.downloads,
            AVG(s.downloads) OVER () as avg_downloads,
            STDDEV(s.downloads) OVER () as std_downloads
        FROM snapshots s
        WHERE s.src = 'npm' 
        AND DATE(s.captured_at) = target_date
        AND s.downloads IS NOT NULL
    ),
    reddit_stats AS (
        SELECT 
            s.project_id,
            s.mentions,
            AVG(s.mentions) OVER () as avg_mentions,
            STDDEV(s.mentions) OVER () as std_mentions
        FROM snapshots s
        WHERE s.src = 'reddit' 
        AND DATE(s.captured_at) = target_date
        AND s.mentions IS NOT NULL
    )
    SELECT 
        COALESCE(g.project_id, n.project_id, r.project_id) as project_id,
        CASE 
            WHEN g.std_stars > 0 THEN (g.stars - g.avg_stars) / g.std_stars
            ELSE 0
        END as github_z_score,
        CASE 
            WHEN n.std_downloads > 0 THEN (n.downloads - n.avg_downloads) / n.std_downloads
            ELSE 0
        END as npm_z_score,
        CASE 
            WHEN r.std_mentions > 0 THEN (r.mentions - r.avg_mentions) / r.std_mentions
            ELSE 0
        END as reddit_z_score
    FROM github_stats g
    FULL OUTER JOIN npm_stats n ON g.project_id = n.project_id
    FULL OUTER JOIN reddit_stats r ON COALESCE(g.project_id, n.project_id) = r.project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh daily rankings for a specific date
CREATE OR REPLACE FUNCTION refresh_daily_rankings(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    z_score_record RECORD;
    prev_score_record RECORD;
BEGIN
    -- Get the most recent snapshots for the target date
    WITH latest_snapshots AS (
        SELECT DISTINCT ON (project_id, src)
            project_id,
            src,
            stars,
            forks,
            downloads,
            mentions,
            captured_at
        FROM snapshots
        WHERE DATE(captured_at) = target_date
        ORDER BY project_id, src, captured_at DESC
    ),
    github_data AS (
        SELECT project_id, stars, forks
        FROM latest_snapshots
        WHERE src = 'github'
    ),
    npm_data AS (
        SELECT project_id, downloads
        FROM latest_snapshots
        WHERE src = 'npm'
    ),
    reddit_data AS (
        SELECT project_id, mentions
        FROM latest_snapshots
        WHERE src = 'reddit'
    ),
    z_scores AS (
        SELECT * FROM calculate_z_scores(target_date)
    )
    INSERT INTO daily_rankings (
        project_id,
        date,
        github_stars,
        github_forks,
        npm_downloads,
        reddit_mentions,
        github_z_score,
        npm_z_score,
        reddit_z_score,
        momentum_score,
        prev_score,
        delta_vs_prev
    )
    SELECT 
        p.project_id,
        target_date,
        g.stars,
        g.forks,
        n.downloads,
        r.mentions,
        zs.github_z_score,
        zs.npm_z_score,
        zs.reddit_z_score,
        -- Weighted momentum score: 0.5 GitHub + 0.3 npm + 0.2 Reddit
        COALESCE(zs.github_z_score * 0.5, 0) + 
        COALESCE(zs.npm_z_score * 0.3, 0) + 
        COALESCE(zs.reddit_z_score * 0.2, 0) as momentum_score,
        -- Get previous day's score
        (SELECT momentum_score 
         FROM daily_rankings 
         WHERE project_id = p.project_id 
         AND date = target_date - INTERVAL '1 day'
         LIMIT 1) as prev_score,
        -- Calculate delta vs previous period
        (COALESCE(zs.github_z_score * 0.5, 0) + 
         COALESCE(zs.npm_z_score * 0.3, 0) + 
         COALESCE(zs.reddit_z_score * 0.2, 0)) - 
        COALESCE((SELECT momentum_score 
                  FROM daily_rankings 
                  WHERE project_id = p.project_id 
                  AND date = target_date - INTERVAL '1 day'
                  LIMIT 1), 0) as delta_vs_prev
    FROM projects p
    LEFT JOIN github_data g ON p.project_id = g.project_id
    LEFT JOIN npm_data n ON p.project_id = n.project_id
    LEFT JOIN reddit_data r ON p.project_id = r.project_id
    LEFT JOIN z_scores zs ON p.project_id = zs.project_id
    ON CONFLICT (project_id, date) DO UPDATE SET
        github_stars = EXCLUDED.github_stars,
        github_forks = EXCLUDED.github_forks,
        npm_downloads = EXCLUDED.npm_downloads,
        reddit_mentions = EXCLUDED.reddit_mentions,
        github_z_score = EXCLUDED.github_z_score,
        npm_z_score = EXCLUDED.npm_z_score,
        reddit_z_score = EXCLUDED.reddit_z_score,
        momentum_score = EXCLUDED.momentum_score,
        prev_score = EXCLUDED.prev_score,
        delta_vs_prev = EXCLUDED.delta_vs_prev,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy querying of top projects
CREATE OR REPLACE VIEW top_projects AS
SELECT 
    dr.project_id,
    p.name,
    p.description,
    dr.date,
    dr.momentum_score,
    dr.delta_vs_prev,
    dr.github_stars,
    dr.github_forks,
    dr.npm_downloads,
    dr.reddit_mentions,
    dr.github_z_score,
    dr.npm_z_score,
    dr.reddit_z_score
FROM daily_rankings dr
JOIN projects p ON dr.project_id = p.project_id
WHERE dr.date = (SELECT MAX(date) FROM daily_rankings);

-- Grant necessary permissions
GRANT SELECT ON daily_rankings TO anon, authenticated;
GRANT SELECT ON top_projects TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_daily_rankings(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION calculate_z_scores(DATE) TO service_role; 