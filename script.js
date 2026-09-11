document.getElementById('year').textContent = new Date().getFullYear();

const pageLoader = document.getElementById('pageLoader');

init();

async function init() {
  let content;
  try {
    content = await fetchContent();
  } catch (err) {
    console.error('Failed to load site content', err);
    document.querySelector('main').innerHTML =
      '<p class="load-error">This page could not load its content right now. Please refresh, or try again shortly.</p>';
    pageLoader.classList.add('is-hidden');
    return;
  }

  renderSite(content);
  pageLoader.classList.add('is-hidden');
}

function renderSite(content) {
  /* ===== Site-wide fields ===== */
  document.title = `${content.site.name} — ${content.site.role}`;
  document.getElementById('logoText').innerHTML =
    content.site.name.split(' ').map(w => w[0]).join('') + '<span class="logo-dot">.</span>';
  document.getElementById('footerName').textContent = content.site.name;

  const cvHref = content.site.cvFile || '#contact';
  [document.getElementById('navCv'), document.getElementById('mobileCv'), document.getElementById('aboutCv')]
    .forEach(el => el.setAttribute('href', cvHref));

  document.getElementById('waCard').setAttribute('href', `https://wa.me/${content.site.whatsapp}`);
  document.getElementById('emailCard').setAttribute('href', `mailto:${content.site.email}`);
  document.getElementById('emailCardValue').textContent = content.site.email;
  document.getElementById('igCard').setAttribute('href', content.site.instagram);

  /* ===== Hero ===== */
  const heroTitle = document.getElementById('heroTitle');
  heroTitle.innerHTML = `
    <span class="line">${escapeHtml(content.hero.titleLine1)}</span>
    <span class="line">${escapeHtml(content.hero.titleLine2)}</span>
    <span class="line hero-title-accent">${escapeHtml(content.hero.titleLine3)}</span>
  `;
  document.getElementById('heroLede').textContent = content.hero.lede;

  document.getElementById('heroStats').innerHTML = [
    [content.hero.stat1Num, content.hero.stat1Label],
    [content.hero.stat2Num, content.hero.stat2Label],
    [content.hero.stat3Num, content.hero.stat3Label]
  ].map(([num, label]) => `
    <div class="stat">
      <span class="stat-num">${escapeHtml(num)}</span>
      <span class="stat-label">${escapeHtml(label)}</span>
    </div>
  `).join('');

  /* ===== About ===== */
  document.getElementById('aboutHeading').textContent = content.about.heading;
  document.getElementById('aboutP1').textContent = content.about.paragraph1;
  document.getElementById('aboutP2').textContent = content.about.paragraph2;
  if (content.about.photo) {
    const photoEl = document.getElementById('aboutPhoto');
    photoEl.src = content.about.photo;
    photoEl.style.display = '';
  }
  document.getElementById('skillsList').innerHTML =
    content.about.skills.map(s => `<li>${escapeHtml(s)}</li>`).join('');

  /* ===== Contact heading ===== */
  document.getElementById('contactHeading').textContent = content.contact.heading;
  document.getElementById('contactSub').textContent = content.contact.sub;

  /* ===== Projects ===== */
  const PROJECTS = content.projects;
  const list = document.getElementById('projectList');

  function pad(n) { return String(n).padStart(2, '0'); }

  list.innerHTML = PROJECTS.map((p, i) => `
    <div class="project-row" data-category="${p.category}" data-index="${i}" tabindex="0" role="button" aria-label="View ${escapeAttr(p.title)}">
      <span class="project-row-index">${pad(i + 1)}</span>
      <div class="project-row-main">
        <span class="project-row-cat">${escapeHtml(p.categoryLabel)}</span>
        <span class="project-row-title">${escapeHtml(p.title)}</span>
        <span class="project-row-desc">${escapeHtml(p.description)}</span>
      </div>
      <div class="project-row-thumb">
        ${p.image ? `<img src="${p.image}" alt="${escapeAttr(p.title)}" loading="lazy">` : ''}
      </div>
    </div>
  `).join('');

  if (PROJECTS.length === 0) {
    list.innerHTML = '<p class="load-error">No projects added yet.</p>';
  }

  /* ===== Filtering ===== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-row').forEach(row => {
        const match = filter === 'all' || row.dataset.category === filter;
        row.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ===== Lightbox ===== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCat = document.getElementById('lightboxCat');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');

  function openProject(index) {
    const project = PROJECTS[index];
    lightboxImg.src = project.image || '';
    lightboxImg.alt = project.title;
    lightboxCat.textContent = project.categoryLabel;
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.description;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  list.addEventListener('click', (e) => {
    const row = e.target.closest('.project-row');
    if (!row) return;
    openProject(Number(row.dataset.index));
  });
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('.project-row');
    if (!row) return;
    e.preventDefault();
    openProject(Number(row.dataset.index));
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ===== Mobile menu ===== */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Contact form =====
     Static site — the form opens the visitor's email app with a
     pre-filled message addressed to the configured contact email.
  */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const projectType = document.getElementById('projectType').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formNote.textContent = 'Please fill in all required fields.';
      formNote.className = 'form-note is-error';
      return;
    }

    const subject = encodeURIComponent(`New project inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${content.site.email}?subject=${subject}&body=${body}`;

    formNote.textContent = 'Opening your email app to send the message…';
    formNote.className = 'form-note is-success';
  });
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
