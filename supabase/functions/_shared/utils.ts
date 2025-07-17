// supabase/functions/_shared/utils.ts

export async function fetchStars(owner: string, repo: string): Promise<{stars: number, forks: number}> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const token = Deno.env.get("GITHUB_TOKEN");
  
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "FluxRank-GitHub-Collector"
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    if (response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining && parseInt(remaining) < 10) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0
  };
}

export async function fetchRedditMentions(terms: string[]): Promise<number> {
  try {
    // Use Reddit's JSON endpoints to search for mentions
    const subreddits = [
      'programming', 'webdev', 'javascript', 'reactjs', 'node', 'typescript',
      'python', 'rust', 'golang', 'php', 'dotnet', 'java', 'kotlin', 'swift',
      'android', 'ios', 'linux', 'devops', 'aws', 'azure', 'gcp', 'docker',
      'kubernetes', 'datascience', 'machinelearning', 'ai', 'opensource',
      'github', 'stackoverflow', 'redditdev'
    ];

    let totalMentions = 0;
    const searchPromises = subreddits.slice(0, 10).map(async (subreddit) => {
      let subredditMentions = 0;
      for (const term of terms) {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(term)}&restrict_sr=on&t=week&limit=100`;
        const response = await fetch(url, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "FluxRank-Reddit-Collector/2.0 (by /u/fluxrank_bot)"
          }
        });
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("RATE_LIMIT_EXCEEDED");
          }
          continue; // Skip this subreddit/term if it fails
        }
        const data = await response.json();
        const posts = data.data?.children || [];
        // Log the number of posts returned and the first 3 post titles/selftexts
        console.log(`[Reddit][DEBUG] r/${subreddit} term "${term}": ${posts.length} posts returned`);
        posts.slice(0, 3).forEach((post, idx) => {
          const title = post.data?.title || '';
          const selftext = post.data?.selftext || '';
          console.log(`[Reddit][DEBUG] Post ${idx + 1}: title="${title}" selftext="${selftext.slice(0, 80)}..."`);
        });
        // Count posts where the term appears in the title or selftext
        let matches = 0;
        for (const post of posts) {
          const title = post.data?.title?.toLowerCase() || '';
          const selftext = post.data?.selftext?.toLowerCase() || '';
          if (title.includes(term.toLowerCase()) || selftext.includes(term.toLowerCase())) {
            matches++;
          }
        }
        subredditMentions += matches;
        console.log(`[Reddit] Subreddit: r/${subreddit}, Term: "${term}", Matches: ${matches}`);
        // Small delay to be respectful to Reddit's servers
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return subredditMentions;
    });
    const results = await Promise.all(searchPromises);
    totalMentions = results.reduce((sum, count) => sum + count, 0);
    console.log(`[Reddit] Total mentions for terms [${terms.join(', ')}]: ${totalMentions}`);
    return totalMentions;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching Reddit mentions for [${terms.join(', ')}]:`, error.message);
      throw error;
    } else {
      console.error(`Error fetching Reddit mentions for [${terms.join(', ')}]:`, error);
      throw error;
    }
  }
} 