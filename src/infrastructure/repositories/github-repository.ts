export class GitHubRepository {
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.owner = process.env.GITHUB_OWNER || '';
    this.repo = process.env.GITHUB_REPO || '';
  }

  async getFileContent(path: string): Promise<{ content: Buffer; sha: string }> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file from GitHub: ${response.statusText}`);
    }

    const data = await response.json() as { content: string; sha: string };
    return {
      content: Buffer.from(data.content, 'base64'),
      sha: data.sha,
    };
  }

  async updateFile(path: string, content: Buffer, message: string, sha: string): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: content.toString('base64'),
        sha,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update file in GitHub: ${JSON.stringify(error)}`);
    }
  }
}
