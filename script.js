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

  if (content.site.logo) {
    document.getElementById('logoImg').src = content.site.logo;
    document.getElementById('logoImg').style.display = '';
    document.getElementById('logoText').style.display = 'none';
  } else {
    document.getElementById('logoText').innerHTML =
      content.site.name.split(' ').map(w => w[0]).join('') + '<span class="logo-dot">.</span>';
  }

  document.getElementById('footerName').textContent = content.site.name;

  document.getElementById('waCard').setAttribute('href', `https://wa.me/${content.site.whatsapp}`);
  document.getElementById('linkedinCard').setAttribute('href', content.site.linkedin);
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
        ${p.images && p.images[0] ? `<img src="${p.images[0]}" alt="${escapeAttr(p.title)}" loading="lazy">` : ''}
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
  const lightboxTrack = document.getElementById('lightboxTrack');
  const carouselDots = document.getElementById('carouselDots');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const lightboxCat = document.getElementById('lightboxCat');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');

  let currentSlide = 0;
  let currentImages = [];

  function goToSlide(index) {
    if (!currentImages.length) return;
    currentSlide = (index + currentImages.length) % currentImages.length;
    lightboxTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    carouselDots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  function openProject(index) {
    const project = PROJECTS[index];
    currentImages = (project.images && project.images.length) ? project.images : [];
    currentSlide = 0;

    lightboxTrack.innerHTML = currentImages.length
      ? currentImages.map(src => `<div class="carousel-slide"><img src="${src}" alt="${escapeAttr(project.title)}"></div>`).join('')
      : `<div class="carousel-slide"></div>`;

    const showArrows = currentImages.length > 1;
    carouselPrev.style.display = showArrows ? 'flex' : 'none';
    carouselNext.style.display = showArrows ? 'flex' : 'none';

    carouselDots.innerHTML = showArrows
      ? currentImages.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'is-active' : ''}" data-slide="${i}" aria-label="Go to image ${i + 1}"></button>`).join('')
      : '';

    lightboxTrack.style.transform = 'translateX(0)';
    lightboxCat.textContent = project.categoryLabel;
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.description;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  carouselPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  carouselNext.addEventListener('click', () => goToSlide(currentSlide + 1));
  carouselDots.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-slide]');
    if (dot) goToSlide(Number(dot.dataset.slide));
  });

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
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });

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
     Submits directly to Web3Forms (no page reload, no email app
     needed). Web3Forms then emails the message to content.site.email
     and automatically sends the visitor a confirmation email.
  */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async (e) => {
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

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith('YOUR-')) {
      formNote.textContent = 'Contact form is not fully set up yet. Please email directly for now.';
      formNote.className = 'form-note is-error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formNote.textContent = '';
    formNote.className = 'form-note';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New project inquiry from ${name}`,
          from_name: content.site.name,
          name,
          email,
          project_type: projectType,
          message,
          to: content.site.email
        })
      });
      const data = await res.json();

      if (data.success) {
        formNote.textContent = "Thanks — your message is on its way. You'll also get a confirmation email shortly.";
        formNote.className = 'form-note is-success';
        form.reset();
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Contact form submission failed', err);
      formNote.textContent = 'Something went wrong sending your message. Please try again in a moment, or reach out via WhatsApp.';
      formNote.className = 'form-note is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
}

/* =========================================================
   DARK MODE TOGGLE
   ========================================================= */
(function initThemeToggle() {
  const root = document.documentElement;
  const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')]
    .filter(Boolean);

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    toggles.forEach(btn => btn.setAttribute('aria-pressed', theme === 'dark'));
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  applyTheme(currentTheme());
})();

function escapeHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
