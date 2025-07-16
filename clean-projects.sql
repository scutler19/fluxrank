-- Clean up the projects table and add legitimate npm packages
-- This will remove all the desktop apps, games, etc. and add real npm packages

-- First, clear all snapshots (this will remove the foreign key constraints)
DELETE FROM snapshots;

-- Clear all daily rankings (these reference projects too)
DELETE FROM daily_rankings;

-- Now clear all existing projects
DELETE FROM projects;

-- Reset the sequence if needed
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;

-- Add legitimate npm packages and their corresponding GitHub repos
INSERT INTO projects (project_id, name, description) VALUES 
-- Core frameworks and libraries
('react', 'React', 'The library for web and native user interfaces'),
('next', 'Next.js', 'The React Framework for Production'),
('vue', 'Vue.js', 'The Progressive JavaScript Framework'),
('angular', 'Angular', 'Deliver web apps with confidence'),
('svelte', 'Svelte', 'Cybernetically enhanced web apps'),
('express', 'Express', 'Fast, unopinionated, minimalist web framework for Node.js'),
('fastify', 'Fastify', 'Fast and low overhead web framework for Node.js'),
('prisma', 'Prisma', 'Next-generation ORM for Node.js and TypeScript'),
('typeorm', 'TypeORM', 'ORM for TypeScript and JavaScript'),
('supabase', 'Supabase', 'The open source Firebase alternative'),

-- Popular UI libraries
('@mui/material', 'Material-UI', 'React components for faster and easier web development'),
('@chakra-ui/react', 'Chakra UI', 'Simple, modular and accessible component library'),
('antd', 'Ant Design', 'An enterprise-class UI design language and React UI library'),
('@mantine/core', 'Mantine', 'React components library with native dark theme support'),
('@nextui-org/react', 'NextUI', 'Beautiful, fast and modern React UI library'),
('tailwindcss', 'Tailwind CSS', 'A utility-first CSS framework for rapid UI development'),

-- State management and data fetching
('@tanstack/react-query', 'TanStack Query', 'Powerful asynchronous state management for TS/JS'),
('@tanstack/react-table', 'TanStack Table', 'Headless UI for building powerful tables and datagrids'),
('zustand', 'Zustand', 'A small, fast and scalable bearbones state-management solution'),
('jotai', 'Jotai', 'Primitive and flexible state management for React'),
('recoil', 'Recoil', 'Experimental state management library for React apps'),

-- Form handling
('react-hook-form', 'React Hook Form', 'Performant, flexible and extensible forms with easy validation'),
('formik', 'Formik', 'Build forms in React, without the tears'),
('yup', 'Yup', 'Dead simple Object schema validation'),

-- Utilities and tools
('lodash', 'Lodash', 'A modern JavaScript utility library delivering modularity, performance & extras'),
('axios', 'Axios', 'Promise based HTTP client for the browser and node.js'),
('date-fns', 'date-fns', 'Modern JavaScript date utility library'),
('dayjs', 'Day.js', '2KB immutable date-time library alternative to Moment.js'),
('zod', 'Zod', 'TypeScript-first schema validation with static type inference'),

-- Development tools
('eslint', 'ESLint', 'Find and fix problems in your JavaScript code'),
('prettier', 'Prettier', 'An opinionated code formatter'),
('vite', 'Vite', 'Next generation frontend tooling'),
('webpack', 'Webpack', 'A bundler for javascript and friends'),
('rollup', 'Rollup', 'Next-generation ES module bundler'),

-- Testing
('jest', 'Jest', 'Delightful JavaScript Testing Framework with a focus on simplicity'),
('@testing-library/react', 'React Testing Library', 'Simple and complete React DOM testing utilities'),
('vitest', 'Vitest', 'A Vite-native unit test framework'),

-- Database and ORMs
('mongoose', 'Mongoose', 'Elegant MongoDB object modeling for Node.js'),
('sequelize', 'Sequelize', 'Feature-rich ORM for modern Node.js and TypeScript'),
('drizzle-orm', 'Drizzle ORM', 'TypeScript ORM for SQL databases'),

-- Authentication and security
('passport', 'Passport', 'Simple, unobtrusive authentication for Node.js'),
('bcryptjs', 'bcrypt.js', 'Optimized bcrypt in plain JavaScript with zero dependencies'),
('jsonwebtoken', 'jsonwebtoken', 'JSON Web Token implementation (symmetric and asymmetric)'),

-- File handling and middleware
('multer', 'Multer', 'Middleware for handling multipart/form-data'),
('cors', 'CORS', 'Node.js CORS middleware'),
('helmet', 'Helmet', 'Help secure Express apps with various HTTP headers'),

-- GitHub repos (these will be mapped to npm packages)
('facebook/react', 'React', 'The library for web and native user interfaces'),
('vercel/next.js', 'Next.js', 'The React Framework for Production'),
('vuejs/vue', 'Vue.js', 'The Progressive JavaScript Framework'),
('angular/angular', 'Angular', 'Deliver web apps with confidence'),
('sveltejs/svelte', 'Svelte', 'Cybernetically enhanced web apps'),
('expressjs/express', 'Express', 'Fast, unopinionated, minimalist web framework for Node.js'),
('fastify/fastify', 'Fastify', 'Fast and low overhead web framework for Node.js'),
('prisma/prisma', 'Prisma', 'Next-generation ORM for Node.js and TypeScript'),
('typeorm/typeorm', 'TypeORM', 'ORM for TypeScript and JavaScript'),
('supabase/supabase', 'Supabase', 'The open source Firebase alternative'),
('mui/material-ui', 'Material-UI', 'React components for faster and easier web development'),
('chakra-ui/chakra-ui', 'Chakra UI', 'Simple, modular and accessible component library'),
('ant-design/ant-design', 'Ant Design', 'An enterprise-class UI design language and React UI library'),
('mantine/mantine', 'Mantine', 'React components library with native dark theme support'),
('nextui-org/nextui', 'NextUI', 'Beautiful, fast and modern React UI library'),
('tailwindlabs/tailwindcss', 'Tailwind CSS', 'A utility-first CSS framework for rapid UI development'),
('tanstack/react-query', 'TanStack Query', 'Powerful asynchronous state management for TS/JS'),
('tanstack/react-table', 'TanStack Table', 'Headless UI for building powerful tables and datagrids'),
('react-hook-form/react-hook-form', 'React Hook Form', 'Performant, flexible and extensible forms with easy validation'),
('jquense/yup', 'Yup', 'Dead simple Object schema validation'),
('lodash/lodash', 'Lodash', 'A modern JavaScript utility library delivering modularity, performance & extras'),
('axios/axios', 'Axios', 'Promise based HTTP client for the browser and node.js'),
('date-fns/date-fns', 'date-fns', 'Modern JavaScript date utility library'),
('iamkun/dayjs', 'Day.js', '2KB immutable date-time library alternative to Moment.js'),
('colinhacks/zod', 'Zod', 'TypeScript-first schema validation with static type inference'),
('eslint/eslint', 'ESLint', 'Find and fix problems in your JavaScript code'),
('prettier/prettier', 'Prettier', 'An opinionated code formatter'),
('vitejs/vite', 'Vite', 'Next generation frontend tooling'),
('webpack/webpack', 'Webpack', 'A bundler for javascript and friends'),
('rollup/rollup', 'Rollup', 'Next-generation ES module bundler'),
('facebook/jest', 'Jest', 'Delightful JavaScript Testing Framework with a focus on simplicity'),
('testing-library/react-testing-library', 'React Testing Library', 'Simple and complete React DOM testing utilities'),
('vitest-dev/vitest', 'Vitest', 'A Vite-native unit test framework'),
('Automattic/mongoose', 'Mongoose', 'Elegant MongoDB object modeling for Node.js'),
('sequelize/sequelize', 'Sequelize', 'Feature-rich ORM for modern Node.js and TypeScript'),
('drizzle-orm/drizzle-orm', 'Drizzle ORM', 'TypeScript ORM for SQL databases'),
('jaredhanson/passport', 'Passport', 'Simple, unobtrusive authentication for Node.js'),
('dcodeIO/bcrypt.js', 'bcrypt.js', 'Optimized bcrypt in plain JavaScript with zero dependencies'),
('auth0/node-jsonwebtoken', 'jsonwebtoken', 'JSON Web Token implementation (symmetric and asymmetric)'),
('expressjs/multer', 'Multer', 'Middleware for handling multipart/form-data'),
('expressjs/cors', 'CORS', 'Node.js CORS middleware'),
('helmetjs/helmet', 'Helmet', 'Help secure Express apps with various HTTP headers')
ON CONFLICT (project_id) DO NOTHING;

-- Verify the cleanup
SELECT COUNT(*) as total_projects FROM projects;
SELECT project_id, name FROM projects ORDER BY name LIMIT 10; 