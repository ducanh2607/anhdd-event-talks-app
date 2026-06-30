/* ── Category icon & colour map ─────────────────────────── */
const CATEGORY_MAP = {
  feature:      { cls: 'tag-feature',      icon: '✦', label: 'Feature'      },
  change:       { cls: 'tag-change',       icon: '⟳', label: 'Change'       },
  deprecated:   { cls: 'tag-deprecated',   icon: '⚠', label: 'Deprecated'   },
  'breaking change': { cls: 'tag-deprecated', icon: '⚠', label: 'Breaking Change' },
  announcement: { cls: 'tag-announcement', icon: '📣', label: 'Announcement' },
  'fixed':      { cls: 'tag-fix',          icon: '✓', label: 'Fixed'        },
  'fix':        { cls: 'tag-fix',          icon: '✓', label: 'Fixed'        },
  'bug fix':    { cls: 'tag-fix',          icon: '✓', label: 'Bug Fix'      },
  'known issue':{ cls: 'tag-issue',        icon: '!', label: 'Known Issue'  },
  'issue':      { cls: 'tag-issue',        icon: '!', label: 'Issue'        },
};

/* ── State ──────────────────────────────────────────────── */
let selectedEntryIndex = null;
let entries = [];

/* ── DOM References ─────────────────────────────────────── */
const refreshBtn     = document.getElementById('refresh-btn');
const btnIcon        = document.getElementById('btn-icon');
const btnSpinner     = document.getElementById('btn-spinner');
const btnLabel       = document.getElementById('btn-label');
const lastFetched    = document.getElementById('last-fetched');
const entriesFeed    = document.getElementById('entries-feed');
const loadingPanel   = document.getElementById('loading-panel');
const errorPanel     = document.getElementById('error-panel');
const errorMsg       = document.getElementById('error-msg');
const statsBar       = document.getElementById('stats-bar');
const statCount      = document.getElementById('stat-count');
const statUpdated    = document.getElementById('stat-updated');
const tweetPanel     = document.getElementById('tweet-panel');
const tweetText      = document.getElementById('tweet-text');
const charCount      = document.getElementById('char-count');
const tweetLink      = document.getElementById('tweet-link');
const tweetCloseBtn  = document.getElementById('tweet-close-btn');
const tweetDateLabel = document.getElementById('tweet-date-label');

/* ── Helper: classify h3 headings ──────────────────────── */
function classifyH3(h3El) {
  const raw = h3El.textContent.trim().toLowerCase();
  const match = Object.keys(CATEGORY_MAP).find(k => raw.includes(k));
  if (match) {
    const { cls, icon, label } = CATEGORY_MAP[match];
    h3El.className = cls;
    h3El.textContent = `${icon} ${label}`;
  }
}

/* ── Helper: strip HTML to plain text ───────────────────── */
function htmlToText(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/* ── Helper: build tweet text for an entry ──────────────── */
function buildTweetText(entry) {
  const plain = htmlToText(entry.content)
    .replace(/\s+/g, ' ')
    .trim();

  const prefix = `📋 BigQuery Release Notes – ${entry.title}\n\n`;
  const suffix = `\n\n🔗 ${entry.link}\n#BigQuery #GoogleCloud`;
  const budget = 280 - prefix.length - suffix.length;

  let body = plain.length <= budget ? plain : plain.slice(0, budget - 1) + '…';
  return prefix + body + suffix;
}

/* ── Character counter ──────────────────────────────────── */
function updateCharCount() {
  const len = tweetText.value.length;
  charCount.textContent = `${len} / 280`;
  charCount.className = 'char-count' + (len > 280 ? ' over' : len > 250 ? ' warning' : '');
  tweetLink.disabled = len === 0 || len > 280;
}

tweetText.addEventListener('input', updateCharCount);

/* ── Open / Close tweet panel ───────────────────────────── */
function openTweetPanel(idx) {
  const entry = entries[idx];
  tweetDateLabel.textContent = entry.title;
  tweetText.value = buildTweetText(entry);
  updateCharCount();
  tweetPanel.classList.add('visible');
}

function closeTweetPanel() {
  tweetPanel.classList.remove('visible');
}

tweetCloseBtn.addEventListener('click', closeTweetPanel);

/* ── Tweet submit ───────────────────────────────────────── */
tweetLink.addEventListener('click', () => {
  const text = encodeURIComponent(tweetText.value);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
});

/* ── Render an entry card ───────────────────────────────── */
function renderCard(entry, idx) {
  const card = document.createElement('article');
  card.className = 'entry-card';
  card.id = `entry-${idx}`;
  card.setAttribute('aria-label', `Release notes for ${entry.title}`);

  card.innerHTML = `
    <div class="card-header">
      <div class="card-date-group">
        <span class="date-dot" aria-hidden="true"></span>
        <h2 class="card-date">${entry.title}</h2>
      </div>
      <div class="card-actions">
        <button class="select-btn" id="select-btn-${idx}" aria-label="Select entry for tweeting" title="Select to Tweet">
          <span>🐦</span> Tweet this
        </button>
        ${entry.link ? `<a class="link-btn" href="${entry.link}" target="_blank" rel="noopener noreferrer" title="View on Google Cloud Docs" aria-label="Open release notes on Google Cloud">
          <span>↗</span> Docs
        </a>` : ''}
      </div>
    </div>
    <div class="card-content" id="content-${idx}"></div>
  `;

  // Inject content HTML safely via innerHTML on the target div only
  const contentDiv = card.querySelector(`#content-${idx}`);
  contentDiv.innerHTML = entry.content;

  // Classify h3 headings
  contentDiv.querySelectorAll('h3').forEach(classifyH3);

  // Select button handler
  const selectBtn = card.querySelector(`#select-btn-${idx}`);
  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedEntryIndex === idx) {
      // Deselect
      selectedEntryIndex = null;
      card.classList.remove('selected');
      closeTweetPanel();
    } else {
      // Deselect previous
      if (selectedEntryIndex !== null) {
        document.getElementById(`entry-${selectedEntryIndex}`)?.classList.remove('selected');
      }
      selectedEntryIndex = idx;
      card.classList.add('selected');
      openTweetPanel(idx);
    }
  });

  // Click card body also selects
  card.addEventListener('click', () => {
    selectBtn.click();
  });

  return card;
}

/* ── Show / Hide panels ─────────────────────────────────── */
function showPanel(name) {
  loadingPanel.style.display = name === 'loading' ? 'block' : 'none';
  errorPanel.style.display   = name === 'error'   ? 'block' : 'none';
  statsBar.style.display     = name === 'feed'    ? 'flex'  : 'none';
  entriesFeed.style.display  = name === 'feed'    ? 'flex'  : 'none';
}

/* ── Fetch & Render ─────────────────────────────────────── */
async function fetchReleaseNotes() {
  refreshBtn.disabled = true;
  btnIcon.style.display = 'none';
  btnSpinner.style.display = 'block';
  btnLabel.textContent = 'Refreshing…';
  showPanel('loading');
  closeTweetPanel();
  selectedEntryIndex = null;

  try {
    const res = await fetch('/api/release-notes');
    const json = await res.json();

    if (!json.success) {
      errorMsg.textContent = json.error || 'Unknown error occurred.';
      showPanel('error');
      return;
    }

    const data = json.data;
    entries = data.entries;

    // Update stats
    statCount.textContent = entries.length;
    statUpdated.textContent = data.updated_display || '—';
    lastFetched.textContent = `Fetched: ${data.fetched_at}`;

    // Render cards
    entriesFeed.innerHTML = '';
    entries.forEach((entry, idx) => {
      entriesFeed.appendChild(renderCard(entry, idx));
    });

    showPanel('feed');
  } catch (err) {
    errorMsg.textContent = `Network error: ${err.message}`;
    showPanel('error');
  } finally {
    refreshBtn.disabled = false;
    btnIcon.style.display = 'inline';
    btnSpinner.style.display = 'none';
    btnLabel.textContent = 'Refresh';
  }
}

/* ── Init ───────────────────────────────────────────────── */
refreshBtn.addEventListener('click', fetchReleaseNotes);
fetchReleaseNotes();
