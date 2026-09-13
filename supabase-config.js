/*
  إعدادات الاتصال بـ Supabase
  =============================
  هذا الملف الوحيد اللي تحتاجين تعدّلين فيه بياناتك الخاصة.

  1) روحي لمشروعك في supabase.com → Project Settings → API
  2) انسخي "Project URL" و "anon public" key
  3) الصقيهم بالأسفل بدل القيم الحالية

  هذا المفتاح (anon key) آمن أنه يكون ظاهر في كود الموقع —
  هو مصمم للاستخدام العام من المتصفح، والحماية الحقيقية
  موجودة في قواعد RLS داخل قاعدة البيانات (supabase-schema.sql).
*/

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
  إعدادات نموذج التواصل (EmailJS)
  ====================================
  الخطوات الكاملة موجودة في دليل-النشر.md (الجزء الرابع). ملخصها:

  1) أنشئ حساب مجاني في https://www.emailjs.com وأضف Email Service
     (مثلاً حساب Gmail) — هذا يعطيك SERVICE_ID.
  2) أنشئ Template لإشعارك أنت (الرسالة اللي توصلك) — يعطيك TEMPLATE_ID.
  3) أنشئ Template ثاني منفصل للرد التلقائي على الزائر — يعطيك TEMPLATE_ID ثاني.
  4) من Account → General، انسخ الـ Public Key.
  5) الصق القيم الأربعة بالأسفل بدل القيم الحالية.

  هذي القيم آمنة تكون ظاهرة في كود الموقع — هذا استخدامها الطبيعي
  (إرسال من المتصفح مباشرة)، ولا تعطي وصول لأي شيء غير إرسال
  رسائل عبر القوالب المحددة فقط.
*/

const EMAILJS_PUBLIC_KEY = 'YOUR-EMAILJS-PUBLIC-KEY';
const EMAILJS_SERVICE_ID = 'YOUR-EMAILJS-SERVICE-ID';
const EMAILJS_TEMPLATE_NOTIFY = 'YOUR-NOTIFY-TEMPLATE-ID';
const EMAILJS_TEMPLATE_AUTOREPLY = 'YOUR-AUTOREPLY-TEMPLATE-ID';
