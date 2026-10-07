const repoOwner = 'bantais136';
const repoName = 'roblox-game-site';
const issuesApi = `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=open&per_page=5`;

const issuesList = document.getElementById('issues-list');
const issueCount = document.getElementById('issue-count');

async function loadIssues() {
  try {
    const response = await fetch(issuesApi, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error('Unable to load issues.');
    }

    const issues = await response.json();
    const visibleIssues = issues.filter((issue) => !issue.pull_request);

    issueCount.textContent = visibleIssues.length;

    if (!visibleIssues.length) {
      issuesList.innerHTML = `
        <article>
          <div class="issue-header">
            <h3>No open issues yet</h3>
          </div>
          <p class="issue-body">Be the first to share a bug report or feature idea for RelicFall [Dungeon].</p>
        </article>
      `;
      return;
    }

    issuesList.innerHTML = visibleIssues
      .map((issue) => {
        const labels = issue.labels.map((label) => label.name).join(', ') || 'general';
        const shortBody = issue.body ? issue.body.replace(/\s+/g, ' ').trim().slice(0, 180) : 'No description provided yet.';

        return `
          <article>
            <div class="issue-header">
              <h3><a href="${issue.html_url}" target="_blank" rel="noreferrer">#${issue.number} ${issue.title}</a></h3>
              <span class="issue-label">${labels}</span>
            </div>
            <div class="issue-meta">Opened ${new Date(issue.created_at).toLocaleDateString()} · ${issue.comments} comments</div>
            <p class="issue-body">${shortBody}${shortBody.length >= 180 ? '...' : ''}</p>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    issuesList.innerHTML = `
      <article>
        <div class="issue-header">
          <h3>Issue feed unavailable</h3>
        </div>
        <p class="issue-body">GitHub may be rate-limiting public requests. You can still submit feedback through the issue form below.</p>
      </article>
    `;
  }
}

const form = document.getElementById('feedback-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const reporter = document.getElementById('reporter').value.trim();
  const type = document.getElementById('type').value;
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const version = document.getElementById('version').value.trim();
  const platform = document.getElementById('platform').value;

  const payload = [
    `**Reporter:** ${reporter || 'Anonymous'}`,
    `**Type:** ${type}`,
    `**Platform:** ${platform}`,
    `**Game version:** ${version || 'Unknown'}`,
    '',
    description,
  ].join('\n');

  const url = new URL(`https://github.com/${repoOwner}/${repoName}/issues/new`);
  url.searchParams.set('title', title || `Community feedback: ${type}`);
  url.searchParams.set('body', payload);

  window.open(url.toString(), '_blank', 'noopener,noreferrer');
  form.reset();
});

loadIssues();
