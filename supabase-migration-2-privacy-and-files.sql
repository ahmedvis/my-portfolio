-- =========================================================
--  ترحيل (Migration) — تشغّله مرة واحدة فقط
--  =========================================================
--  هذا الملف يطبّق التعديلات التالية على مشروعك الموجود بدون
--  ما يمسح أي محتوى سابق:
--  1) يحذف حقل cvFile غير المستخدم
--  2) يضيف حقل linkedin
--  3) ينشئ بنية أداة "مشاركة الملفات" الجديدة في لوحة التحكم
--
--  شغّله من: Supabase → SQL Editor → New query → الصق هذا → Run
-- =========================================================

-- 1) و 2) تحديث حقول site_content
update site_content
set site = (site - 'cvFile') || '{"linkedin": "https://linkedin.com/"}'::jsonb
where id = 1 and not (site ? 'linkedin');

-- 3) أداة مشاركة الملفات
insert into storage.buckets (id, name, public)
values ('shared-files', 'shared-files', true)
on conflict (id) do nothing;

drop policy if exists "public can view shared-files via direct link" on storage.objects;
create policy "public can view shared-files via direct link"
  on storage.objects for select
  using (bucket_id = 'shared-files');

drop policy if exists "authenticated can upload shared-files" on storage.objects;
create policy "authenticated can upload shared-files"
  on storage.objects for insert
  with check (bucket_id = 'shared-files' and auth.role() = 'authenticated');

drop policy if exists "authenticated can delete shared-files" on storage.objects;
create policy "authenticated can delete shared-files"
  on storage.objects for delete
  using (bucket_id = 'shared-files' and auth.role() = 'authenticated');

create table if not exists shared_files (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  public_url text not null,
  created_at timestamptz default now()
);

alter table shared_files enable row level security;

drop policy if exists "authenticated can read shared_files" on shared_files;
create policy "authenticated can read shared_files"
  on shared_files for select
  using (auth.role() = 'authenticated');

drop policy if exists "authenticated can insert shared_files" on shared_files;
create policy "authenticated can insert shared_files"
  on shared_files for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated can delete shared_files" on shared_files;
create policy "authenticated can delete shared_files"
  on shared_files for delete
  using (auth.role() = 'authenticated');
