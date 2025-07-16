// supabase/functions/discover/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

// Comprehensive mapping of GitHub repos to npm packages
const GITHUB_TO_NPM_MAP: Record<string, string> = {
  // Core frameworks and libraries
  'supabase/supabase': 'supabase',
  'vercel/next.js': 'next',
  'facebook/react': 'react',
  'vuejs/vue': 'vue',
  'angular/angular': '@angular/core',
  'nuxt/nuxt': 'nuxt',
  'sveltejs/svelte': 'svelte',
  'expressjs/express': 'express',
  'fastify/fastify': 'fastify',
  'prisma/prisma': 'prisma',
  'typeorm/typeorm': 'typeorm',
  'nestjs/nest': '@nestjs/core',
  'vitejs/vite': 'vite',
  'webpack/webpack': 'webpack',
  'rollup/rollup': 'rollup',
  'parcel-bundler/parcel': 'parcel',
  'storybookjs/storybook': '@storybook/react',
  'testing-library/react-testing-library': '@testing-library/react',
  'jestjs/jest': 'jest',
  'mochajs/mocha': 'mocha',
  'chalk/chalk': 'chalk',
  'lodash/lodash': 'lodash',
  'moment/moment': 'moment',
  'date-fns/date-fns': 'date-fns',
  'axios/axios': 'axios',
  'node-fetch/node-fetch': 'node-fetch',
  'ws/ws': 'ws',
  'socket.io/socket.io': 'socket.io',
  'mongoosejs/mongoose': 'mongoose',
  'sequelize/sequelize': 'sequelize',
  'drizzle-orm/drizzle-orm': 'drizzle-orm',
  'tailwindlabs/tailwindcss': 'tailwindcss',
  'postcss/postcss': 'postcss',
  'sass/sass': 'sass',
  'less/less.js': 'less',
  'stylus/stylus': 'stylus',
  'eslint/eslint': 'eslint',
  'prettier/prettier': 'prettier',
  'typescript-eslint/typescript-eslint': '@typescript-eslint/eslint-plugin',
  'babel/babel': '@babel/core',
  'swc-project/swc': '@swc/core',
  'esbuild/esbuild': 'esbuild',
  'gulpjs/gulp': 'gulp',
  'gruntjs/grunt': 'grunt',
  'yeoman/generator': 'yo',
  'create-react-app/create-react-app': 'create-react-app',
  'vuejs/vue-cli': '@vue/cli',
  'angular/angular-cli': '@angular/cli',
  'sveltejs/kit': '@sveltejs/kit',
  'nextjs/next.js': 'next',
  'gatsbyjs/gatsby': 'gatsby',
  'remix-run/remix': '@remix-run/react',
  'solidjs/solid': 'solid-js',
  'preactjs/preact': 'preact',
  'infernojs/inferno': 'inferno',
  'alpinejs/alpine': 'alpinejs',
  'stimulus/stimulus': '@hotwired/stimulus',
  'hotwired/turbo': '@hotwired/turbo',
  'rails/rails': 'rails',
  'django/django': 'django',
  'adonisjs/core': '@adonisjs/core',
  'strapi/strapi': 'strapi',
  'keystonejs/keystone': '@keystone-6/core',
  
  // Supabase packages
  'supabase/supabase-js': '@supabase/supabase-js',
  'supabase/gotrue-js': '@supabase/gotrue-js',
  'supabase/postgrest-js': '@supabase/postgrest-js',
  'supabase/realtime-js': '@supabase/realtime-js',
  'supabase/storage-js': '@supabase/storage-js',
  'supabase/functions-js': '@supabase/functions-js',
  'supabase/auth-helpers-nextjs': '@supabase/auth-helpers-nextjs',
  'supabase/auth-helpers-react': '@supabase/auth-helpers-react',
  'supabase/auth-helpers-sveltekit': '@supabase/auth-helpers-sveltekit',
  'supabase/auth-helpers-remix': '@supabase/auth-helpers-remix',
  'supabase/auth-helpers-nuxt': '@supabase/auth-helpers-nuxt',
  'supabase/auth-helpers-vue': '@supabase/auth-helpers-vue',
  'supabase/auth-helpers-angular': '@supabase/auth-helpers-angular',
  'supabase/auth-helpers-solid': '@supabase/auth-helpers-solid',
  'supabase/auth-helpers-preact': '@supabase/auth-helpers-preact',
  'supabase/auth-helpers-inferno': '@supabase/auth-helpers-inferno',
  'supabase/auth-helpers-alpine': '@supabase/auth-helpers-alpine',
  'supabase/auth-helpers-stimulus': '@supabase/auth-helpers-stimulus',
  'supabase/auth-helpers-turbo': '@supabase/auth-helpers-turbo',
  'supabase/auth-helpers-rails': '@supabase/auth-helpers-rails',
  'supabase/auth-helpers-django': '@supabase/auth-helpers-django',
  'supabase/auth-helpers-express': '@supabase/auth-helpers-express',
  'supabase/auth-helpers-fastify': '@supabase/auth-helpers-fastify',
  'supabase/auth-helpers-nest': '@supabase/auth-helpers-nest',
  'supabase/auth-helpers-adonis': '@supabase/auth-helpers-adonis',
  'supabase/auth-helpers-strapi': '@supabase/auth-helpers-strapi',
  'supabase/auth-helpers-keystone': '@supabase/auth-helpers-keystone',
  'supabase/auth-helpers-prisma': '@supabase/auth-helpers-prisma',
  'supabase/auth-helpers-typeorm': '@supabase/auth-helpers-typeorm',
  'supabase/auth-helpers-sequelize': '@supabase/auth-helpers-sequelize',
  'supabase/auth-helpers-mongoose': '@supabase/auth-helpers-mongoose',
  'supabase/auth-helpers-drizzle': '@supabase/auth-helpers-drizzle',
  
  // Additional popular packages
  'react-hook-form/react-hook-form': 'react-hook-form',
  'tanstack/react-query': '@tanstack/react-query',
  'tanstack/react-table': '@tanstack/react-table',
  'framer/motion': 'framer-motion',
  'radix-ui/react-primitives': '@radix-ui/react-primitives',
  'headlessui/react': '@headlessui/react',
  'chakra-ui/chakra-ui': '@chakra-ui/react',
  'mui/material-ui': '@mui/material',
  'ant-design/ant-design': 'antd',
  'mantine/mantine': '@mantine/core',
  'nextui-org/nextui': '@nextui-org/react',
  'shadcn/ui': '@shadcn/ui',
  'lucide-react/lucide': 'lucide-react',
  'react-icons/react-icons': 'react-icons',
  'heroicons/react': '@heroicons/react',
  'phosphor-icons/phosphor-home': '@phosphor-icons/react',
  'dayjs/dayjs': 'dayjs',
  'luxon/luxon': 'luxon',
  'zod/zod': 'zod',
  'yup/yup': 'yup',
  'joi/joi': 'joi',
  'ajv/ajv': 'ajv',
  'class-validator/class-validator': 'class-validator',
  'class-transformer/class-transformer': 'class-transformer',
  'uuid/uuid': 'uuid',
  'nanoid/nanoid': 'nanoid',
  'cuid/cuid': 'cuid',
  'ulid/ulid': 'ulid',
  'bcryptjs/bcrypt.js': 'bcryptjs',
  'argon2/argon2': 'argon2',
  'jsonwebtoken/jsonwebtoken': 'jsonwebtoken',
  'passport/passport': 'passport',
  'multer/multer': 'multer',
  'cors/cors': 'cors',
  'helmet/helmet': 'helmet',
  'compression/compression': 'compression',
  'morgan/morgan': 'morgan',
  'winstonjs/winston': 'winston',
  'pinojs/pino': 'pino',
  'debug/debug': 'debug',
  'dotenv/dotenv': 'dotenv',
  'config/config': 'config',
  'convict/convict': 'convict'
};

async function checkNpmPackage(packageName: string): Promise<boolean> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    return response.ok;
  } catch (error) {
    console.log(`Error checking npm package ${packageName}:`, error);
    return false;
  }
}

async function getNpmPackageName(repoSlug: string, repoName: string): Promise<string | null> {
  // First check the static mapping
  const staticPackage = GITHUB_TO_NPM_MAP[repoSlug];
  if (staticPackage) {
    console.log(`Found static npm package for ${repoSlug}: ${staticPackage}`);
    return staticPackage;
  }
  
  // Try common npm package name patterns
  const possibleNames = [
    repoName.toLowerCase(),
    repoName,
    `@${repoSlug.split('/')[0]}/${repoName}`,
    repoName.replace(/[-_]/g, ''),
    repoName.replace(/[-_]/g, '-'),
    repoName.replace(/[-_]/g, '_')
  ];
  
  for (const packageName of possibleNames) {
    if (await checkNpmPackage(packageName)) {
      console.log(`Found npm package for ${repoSlug}: ${packageName}`);
      return packageName;
    }
  }
  
  console.log(`No npm package found for ${repoSlug}`);
  return null;
}

async function fetchTrendingRepos(): Promise<Array<{slug: string, name: string, description: string}>> {
  // Use GitHub search API for most starred JavaScript/TypeScript repos with package.json
  // This is a strong indicator of npm packages
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/repositories?q=language:javascript+language:typescript+stars:>100+created:>${since}+filename:package.json&sort=stars&order=desc&per_page=100`;
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "FluxRank-Discoverer"
  };
  if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  
  console.log(`Found ${data.items?.length || 0} trending JavaScript/TypeScript repos with package.json`);
  
  // Filter out repositories that are unlikely to be npm packages
  const filteredRepos = (data.items || []).filter((repo: any) => {
    const name = repo.name.toLowerCase();
    const description = (repo.description || "").toLowerCase();
    
    // Skip repositories that are clearly not npm packages
    const skipKeywords = [
      'desktop', 'app', 'application', 'game', 'clone', 'crack', 'hack', 
      'cracked', 'free', 'premium', 'pro', 'professional', 'ultimate',
      'browser', 'browser-extension', 'extension', 'plugin', 'addon',
      'mobile', 'ios', 'android', 'flutter', 'react-native', 'expo',
      'website', 'webapp', 'web-app', 'portfolio', 'blog', 'cms',
      'os', 'operating-system', 'kernel', 'driver', 'firmware',
      'antivirus', 'security', 'firewall', 'vpn', 'proxy',
      'office', 'word', 'excel', 'powerpoint', 'outlook',
      'adobe', 'photoshop', 'illustrator', 'indesign', 'premiere',
      'microsoft', 'windows', 'mac', 'linux', 'ubuntu', 'debian'
    ];
    
    const hasSkipKeyword = skipKeywords.some(keyword => 
      name.includes(keyword) || description.includes(keyword)
    );
    
    if (hasSkipKeyword) {
      console.log(`Skipping ${repo.full_name} - likely not an npm package`);
      return false;
    }
    
    return true;
  });
  
  console.log(`Filtered to ${filteredRepos.length} likely npm package repos`);
  
  return filteredRepos.map((repo: any) => ({
    slug: repo.full_name,
    name: repo.name,
    description: repo.description || ""
  }));
}

async function upsertProjects(projects: Array<{slug: string, name: string, description: string}>) {
  const allProjects = [];
  
  for (const project of projects) {
    // Add the GitHub repo
    allProjects.push({
      project_id: project.slug,
      name: project.name,
      description: project.description
    });
    
    // Check if there's a corresponding npm package using dynamic detection
    const npmPackage = await getNpmPackageName(project.slug, project.name);
    if (npmPackage) {
      allProjects.push({
        project_id: npmPackage,
        name: npmPackage,
        description: `npm package for ${project.slug}`
      });
    }
  }
  
  console.log(`Total projects to upsert: ${allProjects.length}`);
  
  // Upsert all projects
  for (const project of allProjects) {
    await supabase.from('projects').upsert(project);
  }
}

serve(async (_req) => {
  try {
    const trending = await fetchTrendingRepos();
    await upsertProjects(trending);
    return new Response(JSON.stringify({ ok: true, count: trending.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 