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

const SUPABASE_URL = 'https://zcqispgrumtcqlmafcaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWlzcGdydW10Y3FsbWFmY2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTU5OTIsImV4cCI6MjEwNDczMTk5Mn0._3ofTTrJtCFApIWiz48jixqkKW5BmBBDw6mYi8FF5pI';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
  إعدادات نموذج التواصل (EmailJS)
  ====================================
  EmailJS يرسل رسالة الزائر لبريدك، ويقدر أيضاً يرسل للزائر نفسه
  رسالة تأكيد تلقائية (auto-reply) مجاناً — عكس Web3Forms.

  1) روح إلى https://www.emailjs.com وأنشئ حساب مجاني
  2) من "Email Services" اربط بريدك (Gmail أو أي بريد ثاني)
     وانسخ الـ Service ID
  3) من "Email Templates" أنشئ قالب لاستقبال رسائل الزوار
     (استخدم المتغيرات: {{from_name}}, {{from_email}}, {{project_type}},
     {{message}}) وانسخ الـ Template ID
  4) اختياري لكن موصى به: أنشئ قالب ثاني للرد التلقائي على الزائر،
     وفعّله من تبويب "Auto-Reply" داخل القالب الأول (بدون كود إضافي)
  5) من "Account" → "General" انسخ الـ Public Key

  هذا المفتاح (Public Key) آمن أنه يكون ظاهر في كود الموقع — هو
  مصمم للاستخدام العام من المتصفح، تماماً مثل anon key في Supabase.
*/

const EMAILJS_PUBLIC_KEY = 'YOUR-EMAILJS-PUBLIC-KEY';
const EMAILJS_SERVICE_ID = 'YOUR-EMAILJS-SERVICE-ID';
const EMAILJS_TEMPLATE_ID = 'YOUR-EMAILJS-TEMPLATE-ID';

if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith('YOUR-')) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}
