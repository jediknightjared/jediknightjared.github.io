const featuredProjects = [
  {
    name: "Portfolio Shell",
    description: "A static GitHub Pages portfolio with responsive layout and a GitHub-ready project feed.",
    url: "/",
    language: "HTML",
    tag: "Website",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectCard(project) {
  const language = project.language ? `<span>${escapeHtml(project.language)}</span>` : "";
  const stars = Number.isInteger(project.stars) ? `<span>${project.stars} stars</span>` : "";
  const tag = project.tag ? `<span>${escapeHtml(project.tag)}</span>` : "";
  const description = project.description || "A public project from Jared's GitHub profile.";
  const target = project.external ? "_blank" : "_self";

  return `
    <article class="project-card">
      <div class="project-meta">${tag}${language}${stars}</div>
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(description)}</p>
      <a class="text-link" href="${escapeHtml(project.url)}" target="${target}" rel="noreferrer">
        Open project
      </a>
    </article>
  `;
}

function statusCard(message) {
  return `<p class="project-status">${escapeHtml(message)}</p>`;
}

function renderProjects(containerId, projects, emptyMessage) {
  const grid = document.getElementById(containerId);

  if (!grid) {
    return;
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    grid.innerHTML = statusCard(emptyMessage);
    return;
  }

  grid.innerHTML = projects.map(projectCard).join("");
}

function githubRepoToProject(repo, tag) {
  return {
    name: repo.full_name || repo.name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    tag,
    external: true,
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`GitHub responded with ${response.status}`);
  }

  return response.json();
}

async function loadOwnedRepos(username) {
  const repos = await fetchJson(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);

  return repos.filter((repo) => !repo.fork).map((repo) => githubRepoToProject(repo, "GitHub"));
}

async function loadRecentContributionRepos(username) {
  const events = await fetchJson(`https://api.github.com/users/${username}/events/public?per_page=100`);
  const reposByName = new Map();

  events
    .filter((event) => event.repo && !event.repo.name.toLowerCase().startsWith(`${username.toLowerCase()}/`))
    .forEach((event) => {
      if (!reposByName.has(event.repo.name)) {
        reposByName.set(event.repo.name, {
          name: event.repo.name,
          description: `Recent public ${event.type.replace("Event", "").toLowerCase()} activity.`,
          url: `https://github.com/${event.repo.name}`,
          tag: "Contribution",
          external: true,
        });
      }
    });

  return Array.from(reposByName.values()).slice(0, 6);
}

async function loadCommitContributionRepos(username) {
  const searchUrl = `https://api.github.com/search/commits?q=author:${username}&sort=committer-date&order=desc&per_page=30`;
  const searchResults = await fetchJson(searchUrl, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
  const reposByName = new Map();

  searchResults.items
    .map((item) => item.repository)
    .filter((repo) => repo && repo.owner.login.toLowerCase() !== username.toLowerCase())
    .forEach((repo) => {
      if (!reposByName.has(repo.full_name)) {
        reposByName.set(repo.full_name, githubRepoToProject(repo, "Contribution"));
      }
    });

  return Array.from(reposByName.values()).slice(0, 6);
}

async function loadContributedRepos(username) {
  try {
    const recentRepos = await loadRecentContributionRepos(username);

    if (recentRepos.length > 0) {
      return recentRepos;
    }
  } catch (error) {
    // Fall through to commit search, which can surface older authored commits.
  }

  return loadCommitContributionRepos(username);
}

async function loadGithubProjects() {
  const ownedGrid = document.getElementById("projectGrid");
  const contributedGrid = document.getElementById("contributedProjectGrid");
  const username = ownedGrid?.dataset.githubUser || contributedGrid?.dataset.githubUser;

  renderProjects("projectGrid", featuredProjects, "No public repos to show yet.");
  renderProjects("contributedProjectGrid", [], "Loading contributed repos...");

  if (!username) {
    return;
  }

  try {
    const publicRepos = await loadOwnedRepos(username);

    if (publicRepos.length > 0) {
      renderProjects("projectGrid", publicRepos, "No public repos to show yet.");
    }
  } catch (error) {
    if (ownedGrid) {
      ownedGrid.dataset.githubStatus = "fallback";
    }
  }

  try {
    const contributedRepos = await loadContributedRepos(username);
    renderProjects(
      "contributedProjectGrid",
      contributedRepos,
      "No public contributed repos found from recent GitHub activity."
    );
  } catch (error) {
    renderProjects(
      "contributedProjectGrid",
      [],
      "Contributed repos could not be loaded from public GitHub data right now."
    );
  }
}

window.addEventListener("DOMContentLoaded", loadGithubProjects);
