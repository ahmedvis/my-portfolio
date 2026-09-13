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
  loadSharedFiles();
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
  'panel-about': ['About section', 'Your bio and skills.'],
  'panel-contact': ['Contact section', 'Heading and intro text above the contact form.'],
  'panel-projects': ['Projects', 'Add, edit, reorder or remove work shown on the site.'],
  'panel-files': ['File sharing', 'Upload a file privately and get a link to send anyone — not part of the public site.'],
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
  bind('f-site-linkedin', 'site', s => s.linkedin, (s, v) => s.linkedin = v);
  bind('f-site-instagram', 'site', s => s.instagram, (s, v) => s.instagram = v);
  updateLogoPreview();

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
   FILE UPLOADS (logo)
   ========================================================= */
function updateLogoPreview() {
  const el = document.getElementById('logoPreview');
  el.innerHTML = content.site.logo ? `<img src="${content.site.logo}" alt="Logo preview">` : '';
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

handleUpload('f-site-logo-upload', async (url) => {
  content.site.logo = url;
  updateLogoPreview();
  await saveSiteContent({ site: content.site });
  showToast('Logo uploaded');
});

document.getElementById('removeLogoBtn').addEventListener('click', async () => {
  if (!content.site.logo) { showToast('No logo to remove'); return; }
  content.site.logo = '';
  updateLogoPreview();
  try {
    await saveSiteContent({ site: content.site });
    showToast('Logo removed');
  } catch (err) {
    console.error(err);
    showToast('Failed to remove logo — check your connection');
  }
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
          <span>Images (up to 20) — drag to reorder</span>
          <div class="image-gallery" data-gallery="${p.id}">
            ${(p.images || []).map((img, i) => `
              <div class="gallery-item" draggable="true" data-image-index="${i}">
                <div class="gallery-item-thumb"><img src="${img}" alt=""></div>
                <span class="gallery-item-number">${i + 1}</span>
                <button type="button" class="gallery-item-remove" data-remove-image="${p.id}" data-image-index="${i}" title="Remove image">✕</button>
              </div>
            `).join('')}
            ${(p.images || []).length < 20 ? `
              <label class="gallery-add-btn">
                <span class="gallery-add-icon">+</span>
                <span class="gallery-add-label">Add photos</span>
                <input type="file" accept="image/*" multiple hidden data-project-upload="${p.id}">
              </label>
            ` : ''}
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

  const toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    const id = toggle.dataset.toggle;
    openProjectId = openProjectId === id ? null : id;
    renderProjectEditor();
    return;
  }

  const removeImg = e.target.closest('[data-remove-image]');
  if (removeImg) {
    const id = removeImg.dataset.removeImage;
    const index = parseInt(removeImg.dataset.imageIndex, 10) || 0;
    const proj = content.projects.find(p => p.id === id);
    const images = [...(proj.images || [])];
    images.splice(index, 1);
    proj.images = images;
    try {
      await updateProject(id, { images });
      renderProjectEditor();
      showToast('Image removed');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove image — check your connection');
    }
    return;
  }
});

/* ===== Drag & drop reordering for project images ===== */
let dragSrcIndex = null;
let dragProjectId = null;

projectEditorList.addEventListener('dragstart', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  dragSrcIndex = parseInt(item.dataset.imageIndex, 10);
  dragProjectId = item.closest('[data-gallery]').dataset.gallery;
  item.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
});

projectEditorList.addEventListener('dragend', (e) => {
  const item = e.target.closest('.gallery-item');
  if (item) item.classList.remove('is-dragging');
  projectEditorList.querySelectorAll('.gallery-item.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
});

projectEditorList.addEventListener('dragover', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item || dragSrcIndex === null) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  projectEditorList.querySelectorAll('.gallery-item.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
  item.classList.add('is-drop-target');
});

projectEditorList.addEventListener('drop', async (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item || dragSrcIndex === null) return;
  e.preventDefault();
  const gallery = item.closest('[data-gallery]');
  const id = gallery.dataset.gallery;
  if (id !== dragProjectId) { dragSrcIndex = null; dragProjectId = null; return; }

  const targetIndex = parseInt(item.dataset.imageIndex, 10);
  if (targetIndex === dragSrcIndex) { dragSrcIndex = null; dragProjectId = null; return; }

  const proj = content.projects.find(p => p.id === id);
  const images = [...(proj.images || [])];
  const [moved] = images.splice(dragSrcIndex, 1);
  images.splice(targetIndex, 0, moved);
  proj.images = images;
  renderProjectEditor();

  try {
    await updateProject(id, { images });
  } catch (err) {
    console.error(err);
    showToast('Could not save new image order');
  }

  dragSrcIndex = null;
  dragProjectId = null;
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
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const proj = content.projects.find(p => p.id === id);
  const currentImages = [...(proj.images || [])];
  const remainingSlots = 20 - currentImages.length;
  const filesToUpload = files.slice(0, remainingSlots);

  if (files.length > remainingSlots) {
    showToast(`Only ${remainingSlots} more image(s) can be added (20 max)`);
  }
  if (!filesToUpload.length) return;

  const label = e.target.closest('label');
  label.classList.add('is-uploading');
  try {
    const uploadedUrls = await Promise.all(
      filesToUpload.map(file => uploadAsset(file, `projects/${id}`))
    );
    proj.images = [...currentImages, ...uploadedUrls];
    await updateProject(id, { images: proj.images });
    renderProjectEditor();
    showToast(uploadedUrls.length > 1 ? `${uploadedUrls.length} images uploaded` : 'Image uploaded');
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
    images: [],
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
      images: created.images || [],
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
   FILE SHARING (private tool — not part of the public site)
   ========================================================= */
let sharedFiles = [];

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderSharedFiles() {
  const list = document.getElementById('sharedFileList');
  if (sharedFiles.length === 0) {
    list.innerHTML = '<p class="field-hint">No files uploaded yet.</p>';
    return;
  }
  list.innerHTML = sharedFiles.map(f => `
    <div class="shared-file-row" data-id="${f.id}">
      <div class="shared-file-info">
        <span class="shared-file-name">${escapeHtml(f.file_name)}</span>
        <span class="shared-file-date">${new Date(f.created_at).toLocaleDateString()}</span>
      </div>
      <div class="shared-file-actions">
        <button class="btn-secondary" data-copy="${f.id}">Copy link</button>
        <button class="btn-icon" data-delete-file="${f.id}" title="Delete file">✕</button>
      </div>
    </div>
  `).join('');
}

async function loadSharedFiles() {
  try {
    sharedFiles = await fetchSharedFiles();
    renderSharedFiles();
  } catch (err) {
    console.error(err);
    showToast('Could not load shared files');
  }
}

document.getElementById('f-share-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const label = e.target.closest('label');
  label.classList.add('is-uploading');
  try {
    const record = await uploadSharedFile(file);
    sharedFiles.unshift(record);
    renderSharedFiles();
    showToast('File uploaded');
  } catch (err) {
    console.error(err);
    showToast('Upload failed — check your connection');
  } finally {
    label.classList.remove('is-uploading');
    e.target.value = '';
  }
});

document.getElementById('sharedFileList').addEventListener('click', async (e) => {
  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) {
    const f = sharedFiles.find(x => x.id === copyBtn.dataset.copy);
    if (!f) return;
    try {
      await navigator.clipboard.writeText(f.public_url);
      showToast('Link copied');
    } catch {
      prompt('Copy this link:', f.public_url);
    }
    return;
  }

  const delBtn = e.target.closest('[data-delete-file]');
  if (delBtn) {
    const f = sharedFiles.find(x => x.id === delBtn.dataset.deleteFile);
    if (!f) return;
    if (!confirm(`Delete "${f.file_name}"? Anyone with the link will lose access.`)) return;
    try {
      await deleteSharedFile(f.id, f.file_path);
      sharedFiles = sharedFiles.filter(x => x.id !== f.id);
      renderSharedFiles();
      showToast('File deleted');
    } catch (err) {
      console.error(err);
      showToast('Could not delete — try again');
    }
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
