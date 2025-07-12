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

export async function fetchRedditMentions(query: string): Promise<number> {
  try {
    // Use Reddit's JSON endpoints to search for mentions
    // Search in programming-related subreddits for better relevance
    const subreddits = [
      'programming', 'webdev', 'javascript', 'reactjs', 'node', 'typescript',
      'python', 'rust', 'golang', 'php', 'dotnet', 'java', 'kotlin', 'swift',
      'android', 'ios', 'linux', 'devops', 'aws', 'azure', 'gcp', 'docker',
      'kubernetes', 'datascience', 'machinelearning', 'ai', 'opensource',
      'github', 'stackoverflow', 'redditdev'
    ];

    let totalMentions = 0;
    const searchPromises = subreddits.slice(0, 10).map(async (subreddit) => {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&t=week&limit=100`;
        
        const response = await fetch(url, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "FluxRank-Reddit-Collector/1.0 (by /u/fluxrank_bot)"
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("RATE_LIMIT_EXCEEDED");
          }
          return 0; // Skip this subreddit if it fails
        }

        const data = await response.json();
        const posts = data.data?.children || [];
        
        // Count mentions in post titles and comments
        let mentions = posts.length;
        
        // Also check for mentions in comments (limited to avoid rate limits)
        for (const post of posts.slice(0, 5)) {
          try {
            const commentsUrl = `https://www.reddit.com${post.data.permalink}.json`;
            const commentsResponse = await fetch(commentsUrl, {
              headers: {
                "Accept": "application/json",
                "User-Agent": "FluxRank-Reddit-Collector/1.0 (by /u/fluxrank_bot)"
              }
            });
            
            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              const comments = commentsData[1]?.data?.children || [];
              mentions += comments.length;
            }
            
            // Small delay to be respectful to Reddit's servers
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            // Continue if comment fetching fails
            if (error instanceof Error) {
              console.log(`Failed to fetch comments for post in r/${subreddit}:`, error.message);
            } else {
              console.log(`Failed to fetch comments for post in r/${subreddit}:`, error);
            }
          }
        }
        
        return mentions;
      } catch (error) {
        console.log(`Failed to search r/${subreddit}:`, error.message);
        if (error instanceof Error) {
          console.log(`Failed to search r/${subreddit}:`, error.message);
        } else {
          console.log(`Failed to search r/${subreddit}:`, error);
        }
        return 0;
      }
    });

    const results = await Promise.all(searchPromises);
    totalMentions = results.reduce((sum, count) => sum + count, 0);

    return totalMentions;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching Reddit mentions for ${query}:`, error.message);
      throw error;
    } else {
      console.error(`Error fetching Reddit mentions for ${query}:`, error);
      throw error;
    }
  }
} 