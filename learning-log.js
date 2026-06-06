function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function logEntryTemplate(entry) {
  const date = escapeHtml(entry.date || "");
  const label = escapeHtml(entry.label || entry.date || "Recent");
  const title = escapeHtml(entry.title || "Untitled entry");
  const body = escapeHtml(entry.body || "");

  return `
    <article class="log-entry">
      <time datetime="${date}">${label}</time>
      <div>
        <h2>${title}</h2>
        <p>${body}</p>
      </div>
    </article>
  `;
}

function goalTemplate(goal) {
  const title = escapeHtml(goal.title || "Untitled goal");
  const body = escapeHtml(goal.body || "");

  return `
    <article class="goal-card">
      <h3>${title}</h3>
      <p>${body}</p>
    </article>
  `;
}

function renderItems(containerId, items, template, emptyMessage) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="log-status">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = items.map(template).join("");
}

async function loadLearningLog() {
  const logList = document.getElementById("learningLogEntries");
  const goalsList = document.getElementById("learningGoals");

  if (!logList && !goalsList) {
    return;
  }

  try {
    const response = await fetch("/learning-log.json");

    if (!response.ok) {
      throw new Error(`Could not load learning-log.json: ${response.status}`);
    }

    const learningLogData = await response.json();
    const logEntries = Array.isArray(learningLogData) ? learningLogData : learningLogData.log;
    const goals = Array.isArray(learningLogData.goals) ? learningLogData.goals : [];

    renderItems("learningLogEntries", logEntries, logEntryTemplate, "No learning log entries yet.");
    renderItems("learningGoals", goals, goalTemplate, "No learning goals yet.");
  } catch (error) {
    const errorMessage = '<p class="log-status">The learning log could not be loaded. Check learning-log.json and refresh.</p>';

    if (logList) {
      logList.innerHTML = errorMessage;
    }

    if (goalsList) {
      goalsList.innerHTML = errorMessage;
    }
  }
}

window.addEventListener("DOMContentLoaded", loadLearningLog);
