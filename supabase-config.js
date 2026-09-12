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
