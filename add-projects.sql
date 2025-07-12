-- Add projects to the projects table
INSERT INTO projects (project_id, name, description, created_at) VALUES
-- GitHub repositories
('facebook/react', 'React', 'The library for web and native user interfaces', NOW()),
('vuejs/vue', 'Vue.js', 'The Progressive JavaScript Framework', NOW()),
('angular/angular', 'Angular', 'Deliver web apps with confidence', NOW()),
('vercel/next.js', 'Next.js', 'The React Framework for Production', NOW()),
('nuxt/nuxt', 'Nuxt.js', 'The Intuitive Vue Framework', NOW()),
('sveltejs/svelte', 'Svelte', 'Cybernetically enhanced web apps', NOW()),
('expressjs/express', 'Express', 'Fast, unopinionated, minimalist web framework for Node.js', NOW()),
('fastify/fastify', 'Fastify', 'Fast and low overhead web framework, for Node.js', NOW()),
('prisma/prisma', 'Prisma', 'Next-generation ORM for Node.js & TypeScript', NOW()),
('typeorm/typeorm', 'TypeORM', 'ORM for TypeScript and JavaScript', NOW()),
('supabase/supabase', 'Supabase', 'The open source Firebase alternative', NOW()),

-- npm packages (same names as project_id for npm)
('react', 'React', 'React is a JavaScript library for building user interfaces', NOW()),
('vue', 'Vue.js', 'The Progressive JavaScript Framework', NOW()),
('angular', 'Angular', 'Deliver web apps with confidence', NOW()),
('next', 'Next.js', 'The React Framework for Production', NOW()),
('nuxt', 'Nuxt.js', 'The Intuitive Vue Framework', NOW()),
('svelte', 'Svelte', 'Cybernetically enhanced web apps', NOW()),
('express', 'Express', 'Fast, unopinionated, minimalist web framework for Node.js', NOW()),
('fastify', 'Fastify', 'Fast and low overhead web framework, for Node.js', NOW()),
('prisma', 'Prisma', 'Next-generation ORM for Node.js & TypeScript', NOW()),
('typeorm', 'TypeORM', 'ORM for TypeScript and JavaScript', NOW()),
('supabase', 'Supabase', 'The open source Firebase alternative', NOW())

ON CONFLICT (project_id) DO NOTHING; 