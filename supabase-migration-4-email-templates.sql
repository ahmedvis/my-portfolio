-- =========================================================
--  ترحيل (Migration) — تشغّله مرة واحدة فقط
--  =========================================================
--  هذا الملف يضيف حقل جديد اسمه "emailTemplates" داخل
--  site_content، فيه عنوان ومحتوى رسالة الإشعار (اللي توصل
--  صاحب الموقع) وعنوان ومحتوى الرد التلقائي (اللي يوصل الزائر).
--  تقدرين تعدّليهم من لوحة التحكم بدون أي حاجة لتعديل كود.
--
--  شغّله من: Supabase → SQL Editor → New query → الصق هذا → Run
-- =========================================================

update site_content
set site = site || jsonb_build_object(
  'emailTemplates', jsonb_build_object(
    'adminSubject', 'New project inquiry from {{name}}',
    'adminBody', E'You have a new message from your website contact form.\n\nName: {{name}}\nEmail: {{email}}\nProject type: {{projectType}}\n\nMessage:\n{{message}}',
    'autoReplySubject', 'Thank you for reaching out — AHMEDVIS',
    'autoReplyBody', E'Thank you for your message.\n\nYour inquiry has been received. We review every project request carefully and will get back to you within 24–48 hours.\n\nIn the meantime, feel free to explore recent brand identities and case studies at ahmedvis.com.\n\nBest regards,\nAhmed\nVisual Identity Architect'
  )
)
where id = 1 and not (site ? 'emailTemplates');
