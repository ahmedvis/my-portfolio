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
  EmailJS يرسل رسالة الزائر لبريدك (Admin Notification)،
  ويرسل للزائر نفسه رسالة تأكيد تلقائية (Auto-Reply).

  1) روح إلى https://www.emailjs.com وأنشئ حساب مجاني
  2) من "Email Services" اربط بريدك وانسخ الـ Service ID
  3) من "Email Templates" أنشئ القالب الأول للبريد الإداري (template_j243i9i)
  4) أنشئ القالب الثاني للرد التلقائي للعميل (template_4wtt7tg)
  5) من "Account" → "General" انسخ الـ Public Key
*/

const EMAILJS_PUBLIC_KEY = 'NgiCqpRePcIq5YXII';
const EMAILJS_SERVICE_ID = 'service_85u09sj';

// القالب الأول: إشعار لك (Admin Notification)
const EMAILJS_ADMIN_TEMPLATE_ID = 'template_j243i9i';

// القالب الثاني: الرد التلقائي للعميل (Auto-Reply)
const EMAILJS_CLIENT_TEMPLATE_ID = 'template_4wtt7tg';

if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith('YOUR-')) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}