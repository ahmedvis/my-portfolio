-- =========================================================
--  Portfolio Dashboard — Supabase Schema
--  شغّلي هذا الملف كامل داخل Supabase → SQL Editor → Run
-- =========================================================

-- 1) جدول محتوى الموقع (سطر واحد فقط يحتوي كل شيء عدا المشاريع)
create table if not exists site_content (
  id int primary key default 1,
  site jsonb not null,
  hero jsonb not null,
  about jsonb not null,
  contact jsonb not null,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- 2) جدول المشاريع
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  category text not null default 'branding',
  category_label text not null default 'Brand Identity',
  image text not null default '',
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- =========================================================
--  Row Level Security
--  القراءة عامة للجميع (الموقع العام يعرض المحتوى بدون تسجيل دخول)
--  الكتابة (إضافة/تعديل/حذف) مسموحة فقط لمستخدم مسجّل دخول (صاحبة الموقع)
-- =========================================================

alter table site_content enable row level security;
alter table projects enable row level security;

-- قراءة عامة
create policy "public can read site_content"
  on site_content for select
  using (true);

create policy "public can read projects"
  on projects for select
  using (true);

-- كتابة فقط للمستخدم المسجّل دخول (authenticated)
create policy "authenticated can update site_content"
  on site_content for update
  using (auth.role() = 'authenticated');

create policy "authenticated can insert site_content"
  on site_content for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated can insert projects"
  on projects for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated can update projects"
  on projects for update
  using (auth.role() = 'authenticated');

create policy "authenticated can delete projects"
  on projects for delete
  using (auth.role() = 'authenticated');

-- =========================================================
--  البيانات الافتراضية الأولى (تشغّل مرة واحدة فقط)
-- =========================================================

insert into site_content (id, site, hero, about, contact)
values (
  1,
  '{
    "name": "Ahmed Visual",
    "role": "Graphic Designer",
    "email": "hello@ahmedvis.com",
    "whatsapp": "97300000000",
    "instagram": "https://instagram.com/",
    "cvFile": ""
  }'::jsonb,
  '{
    "kicker": "Graphic Designer — Brand & Digital Identity",
    "titleLine1": "Marks that carry",
    "titleLine2": "a story before",
    "titleLine3": "a single word.",
    "lede": "Seven years building visual identities for founders and institutions — from first sketch to every touchpoint that carries the mark.",
    "stat1Num": "40+", "stat1Label": "Projects shipped",
    "stat2Num": "7", "stat2Label": "Years in practice",
    "stat3Num": "28", "stat3Label": "Clients"
  }'::jsonb,
  '{
    "heading": "About",
    "paragraph1": "I''m Ahmed, a graphic designer working under the name Ahmed Visual. For seven years I''ve worked with startups and institutions to build visual identities that hold together — from mark and palette through to print and screen.",
    "paragraph2": "Good design doesn''t decorate an idea. It clarifies it. Every project starts with understanding the client, long before I open a design tool.",
    "skills": ["Adobe Illustrator", "Adobe Photoshop", "Figma", "Adobe InDesign", "After Effects", "Brand Identity", "Packaging Design", "UI/UX Fundamentals"],
    "photo": ""
  }'::jsonb,
  '{
    "heading": "Start a project",
    "sub": "Have a brief or just an idea? Send it over — replies within two business days."
  }'::jsonb
)
on conflict (id) do nothing;

insert into projects (title, category, category_label, image, description, sort_order)
select * from (values
  ('Café Nuwa — Brand Identity', 'branding', 'Brand Identity', '', 'A full visual identity for a neighbourhood café, from mark to menu system and packaging.', 0),
  ('Rahhal — Mobile App', 'digital', 'Digital', '', 'Interface design for a trip-booking app, built around clarity and one-handed use.', 1),
  ('Waha Furniture — Catalogue', 'print', 'Print', '', 'A 40-page printed catalogue introducing a new furniture collection.', 2),
  ('Desert Honey — Packaging', 'packaging', 'Packaging', '', 'Jars, labels and case packaging for a small-batch honey producer.', 3),
  ('Nadi Fitness — Campaign', 'social', 'Social', '', 'Launch campaign assets and story templates for a boutique gym.', 4),
  ('Studio Diya — Brand Identity', 'branding', 'Brand Identity', '', 'Identity for a photography studio, built on warm tones and a custom wordmark.', 5)
) as v(title, category, category_label, image, description, sort_order)
where not exists (select 1 from projects);

-- =========================================================
--  Storage bucket للصور (الصور، السيرة الذاتية)
--  شغّليه بعد الجدول أعلاه
-- =========================================================

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

create policy "public can view portfolio-assets"
  on storage.objects for select
  using (bucket_id = 'portfolio-assets');

create policy "authenticated can upload portfolio-assets"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');

create policy "authenticated can update portfolio-assets"
  on storage.objects for update
  using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');

create policy "authenticated can delete portfolio-assets"
  on storage.objects for delete
  using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');
