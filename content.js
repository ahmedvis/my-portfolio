/*
  طبقة الوصول للبيانات
  =====================
  كل قراءة أو كتابة للمحتوى تمر من هنا. تستخدمها كل من:
  - script.js (الموقع العام — قراءة فقط)
  - admin.js (لوحة التحكم — قراءة وكتابة، بعد تسجيل الدخول)
*/

const DEFAULT_CONTENT = {
  site: {
    name: "Ahmed Visual",
    role: "Graphic Designer",
    email: "hello@ahmedvis.com",
    whatsapp: "97300000000",
    instagram: "https://instagram.com/",
    cvFile: ""
  },
  hero: {
    kicker: "Graphic Designer — Brand & Digital Identity",
    titleLine1: "Marks that carry",
    titleLine2: "a story before",
    titleLine3: "a single word.",
    lede: "Seven years building visual identities for founders and institutions — from first sketch to every touchpoint that carries the mark.",
    stat1Num: "40+", stat1Label: "Projects shipped",
    stat2Num: "7", stat2Label: "Years in practice",
    stat3Num: "28", stat3Label: "Clients"
  },
  about: {
    heading: "About",
    paragraph1: "",
    paragraph2: "",
    skills: [],
    photo: ""
  },
  contact: {
    heading: "Start a project",
    sub: "Have a brief or just an idea? Send it over — replies within two business days."
  },
  projects: []
};

/* جلب كل المحتوى (site_content + قائمة المشاريع مرتبة) */
async function fetchContent() {
  const [{ data: contentRow, error: contentErr }, { data: projectRows, error: projErr }] = await Promise.all([
    supabaseClient.from('site_content').select('*').eq('id', 1).single(),
    supabaseClient.from('projects').select('*').order('sort_order', { ascending: true })
  ]);

  if (contentErr) console.error('fetchContent: site_content error', contentErr);
  if (projErr) console.error('fetchContent: projects error', projErr);

  const merged = {
    site: { ...DEFAULT_CONTENT.site, ...(contentRow?.site || {}) },
    hero: { ...DEFAULT_CONTENT.hero, ...(contentRow?.hero || {}) },
    about: { ...DEFAULT_CONTENT.about, ...(contentRow?.about || {}) },
    contact: { ...DEFAULT_CONTENT.contact, ...(contentRow?.contact || {}) },
    projects: (projectRows || []).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      categoryLabel: p.category_label,
      image: p.image,
      description: p.description,
      sortOrder: p.sort_order
    }))
  };

  return merged;
}

/* حفظ حقول site_content (site / hero / about / contact) */
async function saveSiteContent(partial) {
  const { error } = await supabaseClient
    .from('site_content')
    .update({ ...partial, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) {
    console.error('saveSiteContent error', error);
    throw error;
  }
}

/* إضافة مشروع جديد */
async function createProject(project) {
  const { data, error } = await supabaseClient
    .from('projects')
    .insert({
      title: project.title,
      category: project.category,
      category_label: project.categoryLabel,
      image: project.image,
      description: project.description,
      sort_order: project.sortOrder
    })
    .select()
    .single();
  if (error) { console.error('createProject error', error); throw error; }
  return data;
}

/* تعديل مشروع */
async function updateProject(id, fields) {
  const payload = {};
  if ('title' in fields) payload.title = fields.title;
  if ('category' in fields) payload.category = fields.category;
  if ('categoryLabel' in fields) payload.category_label = fields.categoryLabel;
  if ('image' in fields) payload.image = fields.image;
  if ('description' in fields) payload.description = fields.description;
  if ('sortOrder' in fields) payload.sort_order = fields.sortOrder;

  const { error } = await supabaseClient.from('projects').update(payload).eq('id', id);
  if (error) { console.error('updateProject error', error); throw error; }
}

/* حذف مشروع */
async function deleteProject(id) {
  const { error } = await supabaseClient.from('projects').delete().eq('id', id);
  if (error) { console.error('deleteProject error', error); throw error; }
}

/* رفع ملف (صورة أو PDF) إلى Supabase Storage، يرجّع الرابط العام */
async function uploadAsset(file, folder = 'uploads') {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const path = `${folder}/${Date.now()}-${cleanName}`;
  const { error } = await supabaseClient.storage
    .from('portfolio-assets')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('uploadAsset error', error); throw error; }

  const { data } = supabaseClient.storage.from('portfolio-assets').getPublicUrl(path);
  return data.publicUrl;
}
