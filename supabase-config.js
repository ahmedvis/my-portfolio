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
