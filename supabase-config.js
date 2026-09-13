/*
  إعدادات الاتصال بـ Supabase و EmailJS
  ====================================
*/

const SUPABASE_URL = 'https://zcqispgrumtcqlmafcaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWlzcGdydW10Y3FsbWFmY2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTU5OTIsImV4cCI6MjEwNDczMTk5Mn0._3ofTTrJtCFApIWiz48jixqkKW5BmBBDw6mYi8FF5pI';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
  إعدادات EmailJS
*/
const EMAILJS_PUBLIC_KEY = 'NgiCqpRePcIq5YXII';
const EMAILJS_SERVICE_ID = 'service_85u09sj';

// القالب الأساسي للإشعار
const EMAILJS_ADMIN_TEMPLATE_ID = 'template_j243i9i';

if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith('YOUR-')) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}