const projectGrid = document.getElementById('project-grid');
const filtersContainer = document.getElementById('filters');
const detailPanel = document.getElementById('detail-panel');
const detailName = document.getElementById('detail-name');
const detailSummary = document.getElementById('detail-summary');
const detailArch = document.getElementById('detail-architecture');
const detailTech = document.getElementById('detail-tech');
const detailLinks = document.getElementById('detail-links');
const detailExternal = document.getElementById('detail-external');
const detailNext = document.getElementById('detail-next');
const detailOwners = document.getElementById('detail-owners');
const detailTags = document.getElementById('detail-tags');
const telegramButton = document.getElementById('telegram-action');
const detailStatus = document.getElementById('detail-status');
const searchInput = document.getElementById('search-input');

let projects = [];
let activeFilter = 'all';

function statusClass(status) {
  if (status === 'running') return 'status-running';
  if (status === 'planning') return 'status-planning';
  return 'status-paused';
}

function telegramShareLink(project) {
  const message = encodeURIComponent(`Working on ${project.name} via Project HQ. What's next?`);
  return `https://t.me/share/url?url=&text=${message}`;
}

function renderFilters() {
  const statuses = ['all', ...Array.from(new Set(projects.map((p) => p.status)))];
  filtersContainer.innerHTML = '';
  statuses.forEach((status) => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    if (status === activeFilter) button.classList.add('active');
    button.textContent = status === 'all' ? 'All projects' : status;
    button.addEventListener('click', () => {
      activeFilter = status;
      renderFilters();
      renderProjects();
    });
    filtersContainer.appendChild(button);
  });
}

function renderProjects() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = projects.filter((project) => {
    const matchesStatus = activeFilter === 'all' || project.status === activeFilter;
    const matchesQuery = [project.name, project.summary, project.tags.join(' ')].some((value) =>
      value.toLowerCase().includes(query)
    );
    return matchesStatus && matchesQuery;
  });

  projectGrid.innerHTML = filtered
    .map(
      (project) => `
        <article class="project-card">
          <div class="status-pill ${statusClass(project.status)}">
            <span>${project.status}</span>
          </div>
          <h3>${project.name}</h3>
          <p>${project.summary}</p>
          <div class="owners">
            ${project.owners.map((owner) => `<span class="owner-chip">${owner}</span>`).join('')}
          </div>
          <div class="owners">
            ${project.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
          <button data-project-id="${project.id}">View details</button>
        </article>
      `.trim()
    )
    .join('') || '<p style="color: var(--muted);">No projects matched that filter.</p>';

  projectGrid.querySelectorAll('button[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-project-id');
      const project = projects.find((p) => p.id === id);
      if (project) showProjectDetail(project);
    });
  });
}

function showProjectDetail(project) {
  detailStatus.textContent = project.status;
  detailStatus.className = `status-pill ${statusClass(project.status)}`;
  detailName.textContent = project.name;
  detailSummary.textContent = project.summary;
  detailArch.textContent = project.architecture;
  detailTech.textContent = project.techStack.join(' · ');
  detailLinks.innerHTML = project.links
    .map((link) => `<li><a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a></li>`)
    .join('');
  detailExternal.innerHTML = (project.externalUrls || [])
    .map((link) => `<li><a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a></li>`)
    .join('') || '<li><em>No external URL configured.</em></li>';
  detailNext.innerHTML = project.nextSteps.map((step) => `<li>${step}</li>`).join('');
  detailOwners.innerHTML = project.owners
    .map((owner) => `<span class="owner-chip">${owner}</span>`)
    .join('');
  detailTags.innerHTML = project.tags
    .map((tag) => `<span class="tag-chip">${tag}</span>`)
    .join('');
  telegramButton.href = telegramShareLink(project);
  detailPanel.classList.add('visible');
}

detailPanel.addEventListener('click', (event) => {
  if (event.target === detailPanel) {
    detailPanel.classList.remove('visible');
  }
});

document.getElementById('close-detail').addEventListener('click', () => {
  detailPanel.classList.remove('visible');
});

searchInput.addEventListener('input', () => {
  renderProjects();
});


async function init() {
  try {
    const response = await fetch('projects.json');
    projects = await response.json();
  } catch (error) {
    projectGrid.innerHTML = `<p style="color: var(--muted);">Unable to load projects list.</p>`;
    console.error(error);
    return;
  }

  document.body.classList.add('theme-alt');
  renderFilters();
  renderProjects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
