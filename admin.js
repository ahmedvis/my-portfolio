let content = null; // loaded after sign-in

const loginScreen = document.getElementById('loginScreen');
const adminShell = document.getElementById('adminShell');
const toast = document.getElementById('toast');
const saveIndicator = document.getElementById('saveIndicator');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function markSaving() {
  saveIndicator.textContent = 'Saving…';
  saveIndicator.classList.add('is-saving');
}
function markSaved() {
  saveIndicator.textContent = 'Saved';
  saveIndicator.classList.remove('is-saving');
}
function markError() {
  saveIndicator.textContent = 'Could not save';
  saveIndicator.classList.add('is-saving');
}

/* =========================================================
   AUTH
   ========================================================= */
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showDashboard(session);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.hidden = false;
  adminShell.hidden = true;
}

async function showDashboard(session) {
  loginScreen.hidden = true;
  adminShell.hidden = false;
  document.getElementById('accountEmail').textContent = session.user.email;

  try {
    content = await fetchContent();
  } catch (err) {
    console.error(err);
    showToast('Could not load content — check Supabase setup');
    return;
  }
  bindAllFields();
  renderProjectEditor();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  btn.textContent = 'Signing in…';
  btn.disabled = true;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  btn.textContent = 'Sign in';
  btn.disabled = false;

  if (error) {
    errorEl.textContent = 'Incorrect email or password.';
    return;
  }
  showDashboard(data.session);
});

document.getElementById('signOutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

checkSession();

/* =========================================================
   PANEL NAVIGATION
   ========================================================= */
const panelMeta = {
  'panel-site': ['Site settings', 'Basic details used across the site.'],
  'panel-hero': ['Hero section', 'The first thing a visitor sees.'],
  'panel-about': ['About section', 'Your bio, photo and skills.'],
  'panel-contact': ['Contact section', 'Heading and intro text above the contact form.'],
  'panel-projects': ['Projects', 'Add, edit, reorder or remove work shown on the site.'],
  'panel-account': ['Account', 'Session and backup.']
};

function goToPanel(id) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('is-active', p.id === id));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.toggle('is-active', l.dataset.panel === id));
  document.getElementById('panelTitle').textContent = panelMeta[id][0];
  document.getElementById('panelSub').textContent = panelMeta[id][1];
  window.scrollTo({ top: 0 });
}

document.querySelectorAll('.admin-nav-link').forEach(link => {
  link.addEventListener('click', () => goToPanel(link.dataset.panel));
});
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => goToPanel(btn.dataset.goto));
});

/* =========================================================
   FIELD BINDING — debounced autosave to Supabase
   ========================================================= */
let saveTimer = null;
function scheduleSave(section) {
  markSaving();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await saveSiteContent({ [section]: content[section] });
      markSaved();
    } catch (err) {
      console.error(err);
      markError();
      showToast('Save failed — check your connection');
    }
  }, 500);
}

function bind(elId, section, getVal, setVal) {
  const el = document.getElementById(elId);
  el.value = getVal(content[section]);
  el.addEventListener('input', () => {
    setVal(content[section], el.value);
    scheduleSave(section);
  });
}

function bindAllFields() {
  // Site
  bind('f-site-name', 'site', s => s.name, (s, v) => s.name = v);
  bind('f-site-role', 'site', s => s.role, (s, v) => s.role = v);
  bind('f-site-email', 'site', s => s.email, (s, v) => s.email = v);
  bind('f-site-whatsapp', 'site', s => s.whatsapp, (s, v) => s.whatsapp = v);
  bind('f-site-instagram', 'site', s => s.instagram, (s, v) => s.instagram = v);
  updateCvPreview();

  // Hero
  bind('f-hero-kicker', 'hero', h => h.kicker, (h, v) => h.kicker = v);
  bind('f-hero-l1', 'hero', h => h.titleLine1, (h, v) => h.titleLine1 = v);
  bind('f-hero-l2', 'hero', h => h.titleLine2, (h, v) => h.titleLine2 = v);
  bind('f-hero-l3', 'hero', h => h.titleLine3, (h, v) => h.titleLine3 = v);
  bind('f-hero-lede', 'hero', h => h.lede, (h, v) => h.lede = v);
  bind('f-stat1-num', 'hero', h => h.stat1Num, (h, v) => h.stat1Num = v);
  bind('f-stat1-label', 'hero', h => h.stat1Label, (h, v) => h.stat1Label = v);
  bind('f-stat2-num', 'hero', h => h.stat2Num, (h, v) => h.stat2Num = v);
  bind('f-stat2-label', 'hero', h => h.stat2Label, (h, v) => h.stat2Label = v);
  bind('f-stat3-num', 'hero', h => h.stat3Num, (h, v) => h.stat3Num = v);
  bind('f-stat3-label', 'hero', h => h.stat3Label, (h, v) => h.stat3Label = v);

  // About
  bind('f-about-heading', 'about', a => a.heading, (a, v) => a.heading = v);
  bind('f-about-p1', 'about', a => a.paragraph1, (a, v) => a.paragraph1 = v);
  bind('f-about-p2', 'about', a => a.paragraph2, (a, v) => a.paragraph2 = v);
  updatePhotoPreview();

  const skillsTextarea = document.getElementById('f-about-skills');
  skillsTextarea.value = content.about.skills.join('\n');
  skillsTextarea.addEventListener('input', () => {
    content.about.skills = skillsTextarea.value.split('\n').map(s => s.trim()).filter(Boolean);
    scheduleSave('about');
  });

  // Contact
  bind('f-contact-heading', 'contact', c => c.heading, (c, v) => c.heading = v);
  bind('f-contact-sub', 'contact', c => c.sub, (c, v) => c.sub = v);
}

/* =========================================================
   FILE UPLOADS (résumé PDF, portrait photo)
   ========================================================= */
function updateCvPreview() {
  const el = document.getElementById('cvPreview');
  el.textContent = content.site.cvFile ? 'résumé.pdf uploaded' : 'No file uploaded';
}
function updatePhotoPreview() {
  const el = document.getElementById('photoPreview');
  el.innerHTML = content.about.photo ? `<img src="${content.about.photo}" alt="Portrait preview">` : '';
}

async function handleUpload(inputId, onDone) {
  const input = document.getElementById(inputId);
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const label = input.closest('label');
    label.classList.add('is-uploading');
    try {
      const url = await uploadAsset(file, inputId);
      onDone(url);
    } catch (err) {
      console.error(err);
      showToast('Upload failed — check your connection');
    } finally {
      label.classList.remove('is-uploading');
      input.value = '';
    }
  });
}

handleUpload('f-site-cv-upload', async (url) => {
  content.site.cvFile = url;
  updateCvPreview();
  await saveSiteContent({ site: content.site });
  showToast('Résumé uploaded');
});

handleUpload('f-about-photo-upload', async (url) => {
  content.about.photo = url;
  updatePhotoPreview();
  await saveSiteContent({ about: content.about });
  showToast('Photo uploaded');
});

/* =========================================================
   PROJECTS
   ========================================================= */
const projectEditorList = document.getElementById('projectEditorList');
let openProjectId = null;

const CATEGORY_OPTIONS = [
  ['branding', 'Brand Identity'],
  ['digital', 'Digital'],
  ['print', 'Print'],
  ['packaging', 'Packaging'],
  ['social', 'Social']
];

function escapeHtml(s) { return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

function renderProjectEditor() {
  projectEditorList.innerHTML = content.projects.map((p, i) => `
    <div class="project-editor-card" data-id="${p.id}">
      <div class="project-editor-head" data-toggle="${p.id}">
        <span class="project-editor-title"><span class="idx">${String(i + 1).padStart(2, '0')}</span>${escapeHtml(p.title) || 'Untitled project'}</span>
        <div class="project-editor-head-actions">
          <button class="btn-icon" data-move-up="${p.id}" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn-icon" data-move-down="${p.id}" title="Move down" ${i === content.projects.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn-icon" data-delete="${p.id}" title="Delete project">✕</button>
        </div>
      </div>
      <div class="project-editor-body ${openProjectId === p.id ? 'is-open' : ''}" data-body="${p.id}">
        <label class="field field-wide">
          <span>Title</span>
          <input type="text" data-field="title" data-id="${p.id}" value="${escapeAttr(p.title)}">
        </label>
        <label class="field">
          <span>Category</span>
          <select data-field="category" data-id="${p.id}">
            ${CATEGORY_OPTIONS.map(([val, label]) => `<option value="${val}" ${p.category === val ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <div class="field">
          <span>Image</span>
          <div class="upload-row" style="margin-top:0">
            <div class="upload-preview upload-preview-image">${p.image ? `<img src="${p.image}" alt="">` : ''}</div>
            <label class="btn-secondary file-btn">
              Upload
              <input type="file" accept="image/*" hidden data-project-upload="${p.id}">
            </label>
          </div>
        </div>
        <label class="field field-wide">
          <span>Description</span>
          <textarea data-field="description" data-id="${p.id}" rows="2">${escapeHtml(p.description)}</textarea>
        </label>
      </div>
    </div>
  `).join('');
}

projectEditorList.addEventListener('click', async (e) => {
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    const id = toggle.dataset.toggle;
    openProjectId = openProjectId === id ? null : id;
    renderProjectEditor();
    return;
  }

  const del = e.target.closest('[data-delete]');
  if (del) {
    const id = del.dataset.delete;
    const proj = content.projects.find(p => p.id === id);
    if (confirm(`Delete "${proj.title}"? This can't be undone.`)) {
      try {
        await deleteProject(id);
        content.projects = content.projects.filter(p => p.id !== id);
        renderProjectEditor();
        showToast('Project deleted');
      } catch {
        showToast('Could not delete — try again');
      }
    }
    return;
  }

  const up = e.target.closest('[data-move-up]');
  const down = e.target.closest('[data-move-down]');
  if (up || down) {
    const id = (up || down).dataset.moveUp || (up || down).dataset.moveDown;
    const i = content.projects.findIndex(p => p.id === id);
    const j = up ? i - 1 : i + 1;
    if (j < 0 || j >= content.projects.length) return;
    [content.projects[i], content.projects[j]] = [content.projects[j], content.projects[i]];
    // re-sequence sortOrder for all and persist the swapped pair
    content.projects.forEach((p, idx) => p.sortOrder = idx);
    renderProjectEditor();
    try {
      await Promise.all([
        updateProject(content.projects[i].id, { sortOrder: content.projects[i].sortOrder }),
        updateProject(content.projects[j].id, { sortOrder: content.projects[j].sortOrder })
      ]);
    } catch {
      showToast('Could not save new order');
    }
    return;
  }
});

projectEditorList.addEventListener('input', (e) => {
  const field = e.target.dataset.field;
  const id = e.target.dataset.id;
  if (!field || !id) return;
  const proj = content.projects.find(p => p.id === id);
  proj[field] = e.target.value;
  if (field === 'category') {
    proj.categoryLabel = CATEGORY_OPTIONS.find(([val]) => val === e.target.value)[1];
  }
  if (field === 'title') {
    const titleEl = projectEditorList.querySelector(`.project-editor-card[data-id="${id}"] .project-editor-title`);
    if (titleEl) titleEl.lastChild.textContent = e.target.value || 'Untitled project';
  }

  markSaving();
  clearTimeout(proj._saveTimer);
  proj._saveTimer = setTimeout(async () => {
    try {
      const payload = field === 'category'
        ? { category: proj.category, categoryLabel: proj.categoryLabel }
        : { [field]: proj[field] };
      await updateProject(id, payload);
      markSaved();
    } catch (err) {
      console.error(err);
      markError();
      showToast('Save failed — check your connection');
    }
  }, 500);
});

projectEditorList.addEventListener('change', async (e) => {
  const id = e.target.dataset.projectUpload;
  if (!id) return;
  const file = e.target.files[0];
  if (!file) return;
  const label = e.target.closest('label');
  label.classList.add('is-uploading');
  try {
    const url = await uploadAsset(file, `projects/${id}`);
    const proj = content.projects.find(p => p.id === id);
    proj.image = url;
    await updateProject(id, { image: url });
    renderProjectEditor();
    showToast('Image uploaded');
  } catch (err) {
    console.error(err);
    showToast('Upload failed — check your connection');
  } finally {
    label.classList.remove('is-uploading');
  }
});

document.getElementById('addProjectBtn').addEventListener('click', async () => {
  const draft = {
    title: 'New project',
    category: 'branding',
    categoryLabel: 'Brand Identity',
    image: '',
    description: '',
    sortOrder: content.projects.length
  };
  try {
    const created = await createProject(draft);
    content.projects.push({
      id: created.id,
      title: created.title,
      category: created.category,
      categoryLabel: created.category_label,
      image: created.image,
      description: created.description,
      sortOrder: created.sort_order
    });
    openProjectId = created.id;
    renderProjectEditor();
    showToast('Project added');
    document.querySelector(`[data-body="${created.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    console.error(err);
    showToast('Could not add project — check your connection');
  }
});

/* =========================================================
   ACCOUNT — export backup
   ========================================================= */
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded');
});
