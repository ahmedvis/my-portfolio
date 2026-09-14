// =========================================================
//  Supabase Edge Function — send-contact-email
// =========================================================
//  يستقبل بيانات نموذج التواصل من الموقع، يجيب قوالب الرسائل
//  (العنوان والمحتوى) من جدول site_content في قاعدة البيانات —
//  نفس القوالب اللي تُعدّل من لوحة التحكم (Contact panel) —
//  ثم يستبدل المتغيرات فيها ويرسلها عبر Resend:
//  1) رسالة لصاحب الموقع (ADMIN_EMAIL أو toEmail) بتفاصيل الطلب
//  2) رد تلقائي فوري للزائر نفسه
//
//  المفاتيح السرية (RESEND_API_KEY, ADMIN_EMAIL) لا تظهر أبداً
//  في كود الموقع — محفوظة فقط في إعدادات Supabase Edge Function
//  Secrets، ويقرأها هذا الملف وقت التشغيل من جهة الخادم.
// =========================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
// عنوان "from" لازم يكون على دومين موثّق (verified) عند Resend.
// لو لسا ما وثّقتِ دومين، اتركي القيمة الافتراضية دي مؤقتاً.
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_TEMPLATES = {
  adminSubject: 'New project inquiry from {{name}}',
  adminBody: 'You have a new message from your website contact form.\n\nName: {{name}}\nEmail: {{email}}\nProject type: {{projectType}}\n\nMessage:\n{{message}}',
  autoReplySubject: 'Thank you for reaching out',
  autoReplyBody: 'Thank you for your message. We\'ll get back to you soon.',
};

function escapeHtml(str: string): string {
  return (str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] as string));
}

// يستبدل {{name}}, {{email}}, {{projectType}}, {{message}} بالقيم الفعلية
function fillTemplate(template: string, vars: Record<string, string>): string {
  return (template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function toHtmlParagraphs(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

async function fetchEmailTemplates() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return DEFAULT_TEMPLATES;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from('site_content')
      .select('site')
      .eq('id', 1)
      .single();
    if (error || !data?.site?.emailTemplates) return DEFAULT_TEMPLATES;
    return { ...DEFAULT_TEMPLATES, ...data.site.emailTemplates };
  } catch (err) {
    console.error('fetchEmailTemplates error', err);
    return DEFAULT_TEMPLATES;
  }
}

async function sendEmail(payload: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Resend error', data);
    throw new Error(data.message || 'Resend request failed');
  }
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY || !ADMIN_EMAIL) {
      throw new Error('Server is missing RESEND_API_KEY or ADMIN_EMAIL configuration.');
    }

    const { name, email, projectType, message, toEmail } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const recipient = toEmail || ADMIN_EMAIL;
    const templates = await fetchEmailTemplates();

    const vars = {
      name,
      email,
      projectType: projectType || 'Not specified',
      message,
    };

    // 1) الرسالة اللي توصل صاحب الموقع
    await sendEmail({
      from: `Website Contact Form <${FROM_EMAIL}>`,
      to: [recipient],
      reply_to: email,
      subject: fillTemplate(templates.adminSubject, vars),
      html: `<p>${toHtmlParagraphs(fillTemplate(templates.adminBody, vars))}</p>`,
    });

    // 2) الرد التلقائي اللي يوصل الزائر
    await sendEmail({
      from: `Ahmed Visual <${FROM_EMAIL}>`,
      to: [email],
      subject: fillTemplate(templates.autoReplySubject, vars),
      html: `<p>${toHtmlParagraphs(fillTemplate(templates.autoReplyBody, vars))}</p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-contact-email error', err);
    return new Response(JSON.stringify({ error: err.message || 'Something went wrong.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
