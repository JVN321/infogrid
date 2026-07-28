-- Supabase Database Schema for Campus News & Achievements Showcase
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- 1. Create Campus News table
CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL,
    tag_color TEXT DEFAULT 'blue',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT NOT NULL, -- Cloudflare Bucket Image URL or Key
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) and allow public reads + authenticated/anon writes for showcase demo
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow anon all on news" ON public.news FOR ALL USING (true);

-- 2. Create Achievements Showcase table
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    badge_type TEXT DEFAULT 'trophy', -- 'trophy' | 'medal' | 'ribbon' | 'star'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT NOT NULL, -- Cloudflare Bucket Image URL or Key
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow anon all on achievements" ON public.achievements FOR ALL USING (true);

-- Initial seed data for Campus News
INSERT INTO public.news (id, tag, tag_color, title, description, date, image) VALUES
('news-1', 'NEW', 'blue', 'New AI & DS Lab Inaugurated', 'The state-of-the-art AI & DS laboratory was inaugurated to empower innovation and research.', '28 May 2025', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'),
('news-2', 'PLACEMENT', 'green', 'Placement Drive 2025', 'Over 40+ companies participated in the placement drive for the Batch of 2025.', '27 May 2025', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'),
('news-3', 'INITIATIVE', 'darkgreen', 'Green Campus Initiative', 'Tree plantation drive held across the campus to promote a sustainable future.', '26 May 2025', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'),
('news-4', 'TALK', 'orange', 'Expert Talk on Cybersecurity', 'An insightful session on emerging cybersecurity trends and career opportunities.', '24 May 2025', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Initial seed data for Achievements
INSERT INTO public.achievements (id, badge_type, title, description, date, image) VALUES
('ach-1', 'trophy', 'Hackathon Winners', 'Secured 1st Place at CodeCrafters Hackathon 2025 among 120+ teams.', '22 May 2025', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80'),
('ach-2', 'medal', 'Robotics Championship', 'Our team won the Runners-up title at the National Robotics Championship.', '18 May 2025', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'),
('ach-3', 'ribbon', 'Academic Excellence', 'Secured University 2nd Rank in B.Tech CSE (AI) Final Year Examinations.', '15 May 2025', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'),
('ach-4', 'star', 'Sports Achievement', 'Champions of the Inter-College Football Tournament 2025.', '10 May 2025', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;
