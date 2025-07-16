# FluxRank.io

**Spot tomorrow's breakout dev tools, today.**

FluxRank.io is a real-time leaderboard that tracks the momentum of open source projects by combining GitHub stars, npm downloads, and Reddit buzz into a single momentum score.

## 🚀 Features

- **Real-time Momentum Tracking**: Combines GitHub, npm, and Reddit data into a single momentum score
- **Live Leaderboard**: Updated every 5 minutes with the latest project rankings
- **Smart Project Discovery**: Automatically discovers trending npm packages
- **Daily Rankings**: Historical momentum tracking with sparkline visualizations
- **Twitter Integration**: Automated daily tweets about top movers

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualizations

### Backend
- **Supabase** for database and authentication
- **Supabase Edge Functions** for data collection
- **Vercel** for hosting and cron jobs

### Data Sources
- **GitHub API** for stars and forks
- **npm Registry API** for download counts
- **Reddit API** for community mentions

## 📊 Data Pipeline

1. **Project Discovery**: Daily cron job finds trending npm packages
2. **Data Collection**: Separate collectors for GitHub, npm, and Reddit data
3. **Momentum Calculation**: Z-score based algorithm with weighted scoring
4. **Daily Rankings**: Materialized views for fast leaderboard queries

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Supabase CLI
- Vercel CLI

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/scutler19/fluxrank.git
   cd fluxrank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GITHUB_TOKEN=your_github_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Deploy Supabase functions**
   ```bash
   npx supabase functions deploy discover
   npx supabase functions deploy github
   npx supabase functions deploy npm
   npx supabase functions deploy reddit
   ```

### Database Setup

The database schema is automatically created via Supabase migrations. Key tables:

- `projects`: Project metadata
- `snapshots`: Raw data from APIs
- `daily_rankings`: Calculated momentum scores
- `top_projects`: Materialized view for leaderboard

## 📈 Momentum Algorithm

The momentum score combines three weighted factors:
- **GitHub (50%)**: Stars and forks with z-score normalization
- **npm (30%)**: Weekly downloads with z-score normalization  
- **Reddit (20%)**: Community mentions with z-score normalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Live Site**: [https://fluxrank.io](https://fluxrank.io)
- **Leaderboard**: [https://fluxrank.io/leaderboard](https://fluxrank.io/leaderboard)
- **GitHub**: [https://github.com/scutler19/fluxrank](https://github.com/scutler19/fluxrank)

---

Built with ❤️ for the open source community
