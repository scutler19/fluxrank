-- Create waitlist table for email signups
CREATE TABLE IF NOT EXISTS waitlist (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated and anonymous users
CREATE POLICY "Allow public inserts" ON waitlist
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow reads only to authenticated users (optional, for admin purposes)
CREATE POLICY "Allow authenticated reads" ON waitlist
    FOR SELECT
    TO authenticated
    USING (true); 