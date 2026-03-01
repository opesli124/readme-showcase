'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RepoInfo {
  owner: string;
  repo: string;
  readme: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check URL params for shared repo
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get('repo');
    if (repoParam) {
      try {
        const decoded = atob(repoParam);
        setUrl(decoded);
        // Auto-fetch on load
        fetchReadme(decoded);
      } catch (e) {
        console.error('Invalid repo param');
      }
    }
  }, []);

  const parseGitHubUrl = (input: string): { owner: string; repo: string } | null => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s]+)/,
      /^([^\/]+)\/([^\/\s]+)$/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace('.git', '') };
      }
    }
    return null;
  };

  const fetchReadme = async (inputUrl?: string) => {
    const targetUrl = inputUrl || url;
    setError('');
    setLoading(true);

    const parsed = parseGitHubUrl(targetUrl.trim());
    if (!parsed) {
      setError('Invalid GitHub URL. Try: owner/repo or https://github.com/owner/repo');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or README.md does not exist');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const readmeContent = await response.text();
      setRepoInfo({
        owner: parsed.owner,
        repo: parsed.repo,
        readme: readmeContent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch README');
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!repoInfo) return '';
    const encoded = btoa(`${repoInfo.owner}/${repoInfo.repo}`);
    return `${window.location.origin}/?repo=${encoded}`;
  };

  const copyShareUrl = async () => {
    const shareUrl = getShareUrl();
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const shareToTwitter = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    const text = encodeURIComponent(`Check out this tool! Turn any GitHub README into a beautiful webpage 🚀`);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">README Showcase</h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
            style={{ background: theme === 'light' ? '#f5f5f5' : '#262626' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="mb-8">
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter GitHub repo: owner/repo"
              className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              onKeyDown={(e) => e.key === 'Enter' && fetchReadme()}
            />
            <button
              onClick={() => fetchReadme()}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Generate'}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-pulse text-lg">Fetching README...</div>
          </div>
        )}

        {/* Result Section */}
        {repoInfo && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold">
                {repoInfo.owner}/{repoInfo.repo}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={shareToTwitter}
                  className="px-4 py-2 text-sm bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  🐦 Share
                </button>
                <button
                  onClick={copyShareUrl}
                  className="px-4 py-2 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  🔗 Copy Link
                </button>
                <a
                  href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  📂 GitHub
                </a>
              </div>
            </div>

            {/* README Content */}
            <article className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 sm:p-8">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {repoInfo.readme}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        )}

        {/* Empty State */}
        {!loading && !repoInfo && !error && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">Enter a GitHub repository to showcase its README</p>
            <p className="text-sm mb-6">Example: vercel/next.js</p>
            <a
              href="https://twitter.com/intent/tweet?text=I+just+found+this+awesome+tool:+Turn+any+GitHub+README+into+a+beautiful+webpage+🚀+https://opesli124.github.io/readme-showcase/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              🐦 Share on Twitter
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12 py-6 text-center text-sm text-gray-500">
        <p>Powered by GitHub API</p>
      </footer>
    </div>
  );
}
