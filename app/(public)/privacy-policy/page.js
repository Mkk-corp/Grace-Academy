'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

const CONTENT = {
  en: {
    heroTitle:    'Privacy Policy',
    heroSub:      'Last updated: July 2025',
    breadHome:    'Home',
    breadCurrent: 'Privacy Policy',
    intro: 'Grace Academy ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you use our website and services.',
    sections: [
      {
        title: '1. Information We Collect',
        items: [
          { sub: 'Account information', text: 'Name, email address, date of birth, and educational background provided during registration or profile setup.' },
          { sub: 'Usage data', text: 'Pages visited, features used, session duration, and device/browser information collected automatically when you use our platform.' },
          { sub: 'Communication data', text: 'Messages you send to us via contact forms, email, or in-platform notifications.' },
          { sub: 'Assessment data', text: 'Placement test results, session records, and progress information generated through your learning activity.' },
          { sub: 'Payment data', text: 'Billing information processed securely through our payment providers. We do not store raw card details.' },
        ],
      },
      {
        title: '2. How We Use Your Information',
        items: [
          { text: 'To create and manage your account and provide access to our services.' },
          { text: 'To match you with the appropriate learning level, course, or academic consultant.' },
          { text: 'To schedule and manage placement assessment sessions, including generating Google Meet links.' },
          { text: 'To send transactional emails such as booking confirmations, session reminders, and account notifications.' },
          { text: 'To improve our platform, content, and user experience through analytics.' },
          { text: 'To comply with legal obligations and protect the rights of our users.' },
        ],
      },
      {
        title: '3. Information Sharing',
        body: 'We do not sell, rent, or trade your personal information to third parties. We may share data only in the following circumstances:',
        items: [
          { sub: 'Service providers', text: 'Trusted partners who help us operate our platform (e.g. hosting, email delivery, payment processing) under strict confidentiality agreements.' },
          { sub: 'Google services', text: 'When you or your assessor connects a Google account, limited data is shared with Google to create Calendar events and Meet links. This is governed by Google\'s own Privacy Policy.' },
          { sub: 'Legal requirements', text: 'When required by applicable law, court order, or governmental authority.' },
        ],
      },
      {
        title: '4. Data Security',
        body: 'We implement industry-standard security measures including encrypted connections (HTTPS), hashed credentials, and restricted access controls. While we take every reasonable precaution, no method of transmission over the internet is 100% secure.',
      },
      {
        title: '5. Cookies',
        body: 'We use essential cookies to keep you logged in and remember your language preference. We do not use advertising or tracking cookies. You may clear cookies at any time through your browser settings, though this will log you out of your account.',
      },
      {
        title: '6. Data Retention',
        body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.',
      },
      {
        title: '7. Your Rights',
        items: [
          { text: 'Access the personal data we hold about you.' },
          { text: 'Request correction of inaccurate or incomplete data.' },
          { text: 'Request deletion of your personal data ("right to be forgotten").' },
          { text: 'Object to or restrict processing of your data.' },
          { text: 'Withdraw consent at any time where processing is based on consent.' },
        ],
      },
      {
        title: '8. Children\'s Privacy',
        body: 'Our platform serves learners of all ages, including children. Where a student is under 18, we require parental or guardian consent during enrolment. We do not knowingly collect data from minors without appropriate authorisation.',
      },
      {
        title: '9. Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email or in-platform notification. The "Last updated" date at the top of this page reflects the most recent revision.',
      },
      {
        title: '10. Contact Us',
        body: 'For any privacy-related questions or to exercise your data rights, please contact us at:',
        contact: { email: 'hello@graceacademys.com', label: 'Email' },
      },
    ],
  },
  ar: {
    heroTitle:    'سياسة الخصوصية',
    heroSub:      'آخر تحديث: يوليو ٢٠٢٥',
    breadHome:    'الرئيسية',
    breadCurrent: 'سياسة الخصوصية',
    intro: 'تلتزم أكاديمية جريس ("نحن" أو "الأكاديمية") بحماية معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا للبيانات واستخدامها وحمايتها عند استخدامك لموقعنا وخدماتنا.',
    sections: [
      {
        title: '١. المعلومات التي نجمعها',
        items: [
          { sub: 'بيانات الحساب', text: 'الاسم، والبريد الإلكتروني، وتاريخ الميلاد، والخلفية التعليمية التي تقدمها عند التسجيل أو إعداد الملف الشخصي.' },
          { sub: 'بيانات الاستخدام', text: 'الصفحات التي تزورها، والميزات التي تستخدمها، ومدة الجلسة، ومعلومات الجهاز والمتصفح التي تُجمع تلقائياً.' },
          { sub: 'بيانات التواصل', text: 'الرسائل التي ترسلها إلينا عبر نماذج الاتصال أو البريد الإلكتروني أو إشعارات المنصة.' },
          { sub: 'بيانات التقييم', text: 'نتائج اختبارات تحديد المستوى، وسجلات الجلسات، ومعلومات التقدم الناتجة عن نشاطك التعليمي.' },
          { sub: 'بيانات الدفع', text: 'معلومات الفوترة التي تُعالَج بأمان عبر مزودي الدفع لدينا. لا نحتفظ ببيانات البطاقات الأصلية.' },
        ],
      },
      {
        title: '٢. كيفية استخدام معلوماتك',
        items: [
          { text: 'إنشاء حسابك وإدارته وتوفير الوصول إلى خدماتنا.' },
          { text: 'مطابقتك مع مستوى التعلم أو الدورة أو المستشار الأكاديمي المناسب.' },
          { text: 'جدولة جلسات تقييم تحديد المستوى وإدارتها، بما في ذلك إنشاء روابط Google Meet.' },
          { text: 'إرسال رسائل بريد إلكتروني تشغيلية كتأكيدات الحجز وتذكيرات الجلسات وإشعارات الحساب.' },
          { text: 'تحسين منصتنا ومحتوانا وتجربة المستخدم من خلال التحليلات.' },
          { text: 'الامتثال للالتزامات القانونية وحماية حقوق مستخدمينا.' },
        ],
      },
      {
        title: '٣. مشاركة المعلومات',
        body: 'لا نبيع معلوماتك الشخصية ولا نؤجرها ولا نتاجر بها مع أطراف ثالثة. قد نشارك البيانات فقط في الحالات التالية:',
        items: [
          { sub: 'مزودو الخدمات', text: 'شركاء موثوقون يساعدوننا في تشغيل منصتنا (كالاستضافة وتوصيل البريد الإلكتروني ومعالجة المدفوعات) وفق اتفاقيات سرية صارمة.' },
          { sub: 'خدمات Google', text: 'عند ربط حساب Google من قِبَلك أو من قِبَل المقيِّم، تُشارَك بيانات محدودة مع Google لإنشاء أحداث تقويمية وروابط Meet. يخضع ذلك لسياسة خصوصية Google.' },
          { sub: 'المتطلبات القانونية', text: 'عند الاقتضاء بموجب القانون المعمول به أو أمر المحكمة أو الجهة الحكومية المختصة.' },
        ],
      },
      {
        title: '٤. أمن البيانات',
        body: 'نطبق تدابير أمنية تتوافق مع معايير الصناعة، تشمل اتصالات مشفرة (HTTPS) وبيانات اعتماد مجزأة وضوابط وصول مقيدة. ورغم كل الاحتياطات المعقولة، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.',
      },
      {
        title: '٥. ملفات تعريف الارتباط (Cookies)',
        body: 'نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على تسجيل دخولك وتذكر تفضيلات اللغة. لا نستخدم ملفات تعريف الارتباط الإعلانية أو التتبعية. يمكنك مسحها في أي وقت من إعدادات المتصفح، وإن كان ذلك سيؤدي إلى تسجيل خروجك من حسابك.',
      },
      {
        title: '٦. الاحتفاظ بالبيانات',
        body: 'نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو بالقدر اللازم لتقديم الخدمات. يمكنك طلب حذف حسابك والبيانات المرتبطة به في أي وقت عبر التواصل معنا.',
      },
      {
        title: '٧. حقوقك',
        items: [
          { text: 'الوصول إلى بياناتك الشخصية التي نحتفظ بها.' },
          { text: 'طلب تصحيح البيانات غير الدقيقة أو غير المكتملة.' },
          { text: 'طلب حذف بياناتك الشخصية ("الحق في النسيان").' },
          { text: 'الاعتراض على معالجة بياناتك أو تقييدها.' },
          { text: 'سحب موافقتك في أي وقت عندما تستند المعالجة إلى الموافقة.' },
        ],
      },
      {
        title: '٨. خصوصية الأطفال',
        body: 'تخدم منصتنا متعلمين من جميع الأعمار، بمن فيهم الأطفال. في حال كان الطالب دون الثامنة عشرة، نشترط الحصول على موافقة أحد الوالدين أو الوصي القانوني عند التسجيل. لا نجمع بيانات القاصرين عن قصد دون تفويض مناسب.',
      },
      {
        title: '٩. التغييرات على هذه السياسة',
        body: 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنخطر المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة. يعكس تاريخ "آخر تحديث" في أعلى هذه الصفحة أحدث مراجعة.',
      },
      {
        title: '١٠. تواصل معنا',
        body: 'لأي استفسارات تتعلق بالخصوصية أو لممارسة حقوقك المتعلقة بالبيانات، يرجى التواصل معنا على:',
        contact: { email: 'hello@graceacademys.com', label: 'البريد الإلكتروني' },
      },
    ],
  },
}

export default function PrivacyPolicyPage() {
  const { lang, t } = useLang()
  const isAr = lang === 'ar'
  const c = CONTENT[lang] || CONTENT.en

  return (
    <>
      <style>{`
        .legal-page { padding: 80px 0 120px; }
        .legal-hero { background: linear-gradient(135deg,#0a1b22 0%,#10222b 100%); padding: 80px 0 60px; text-align: center; position: relative; overflow: hidden; }
        .legal-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 60% 0%, rgba(201,147,44,.13) 0%, transparent 65%); pointer-events:none; }
        .legal-hero__bread { display:flex; align-items:center; justify-content:center; gap:8px; font-size:.75rem; color:rgba(255,255,255,.4); margin-bottom:20px; flex-wrap:wrap; }
        .legal-hero__bread a { color:rgba(255,255,255,.4); text-decoration:none; transition:color .15s; }
        .legal-hero__bread a:hover { color:#c9932c; }
        .legal-hero__sep { color:rgba(255,255,255,.2); }
        .legal-hero__title { font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; margin-bottom:12px; letter-spacing:-.02em; }
        .legal-hero__title span { color:#c9932c; }
        .legal-hero__sub { font-size:.9rem; color:rgba(255,255,255,.4); }
        .legal-body { max-width:820px; margin:0 auto; padding:0 24px; }
        .legal-intro { font-size:1rem; line-height:1.8; color:var(--text-secondary,#4b5563); margin:56px 0 48px; padding:24px 28px; background:rgba(201,147,44,.06); border-left:3px solid #c9932c; border-radius:0 10px 10px 0; }
        [dir="rtl"] .legal-intro { border-left:none; border-right:3px solid #c9932c; border-radius:10px 0 0 10px; }
        .legal-section { margin-bottom:44px; }
        .legal-section__title { font-size:1.1rem; font-weight:800; color:var(--text-primary,#111827); margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border,#e5e7eb); }
        .legal-section__body { font-size:.92rem; line-height:1.85; color:var(--text-secondary,#4b5563); margin-bottom:14px; }
        .legal-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
        .legal-list li { display:flex; gap:10px; font-size:.92rem; line-height:1.75; color:var(--text-secondary,#4b5563); align-items:flex-start; }
        .legal-list li::before { content:''; width:6px; height:6px; border-radius:50%; background:#c9932c; flex-shrink:0; margin-top:9px; }
        .legal-list li strong { color:var(--text-primary,#111827); margin-inline-end:4px; }
        .legal-contact { display:inline-flex; align-items:center; gap:8px; margin-top:10px; padding:10px 18px; background:rgba(201,147,44,.08); border:1px solid rgba(201,147,44,.25); border-radius:8px; font-size:.88rem; color:#c9932c; font-weight:600; text-decoration:none; transition:background .15s; }
        .legal-contact:hover { background:rgba(201,147,44,.15); }
        @media(max-width:600px){ .legal-hero { padding:60px 0 40px; } .legal-page { padding:60px 0 80px; } }
      `}</style>

      {/* Hero */}
      <div className="legal-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="legal-hero__bread">
            <Link href="/">{c.breadHome}</Link>
            <span className="legal-hero__sep">/</span>
            <span>{c.breadCurrent}</span>
          </div>
          <h1 className="legal-hero__title">{c.heroTitle}</h1>
          <p className="legal-hero__sub">{c.heroSub}</p>
        </div>
      </div>

      {/* Body */}
      <div className="legal-page">
        <div className="legal-body">
          <p className="legal-intro">{c.intro}</p>

          {c.sections.map((sec, i) => (
            <div key={i} className="legal-section">
              <h2 className="legal-section__title">{sec.title}</h2>
              {sec.body && <p className="legal-section__body">{sec.body}</p>}
              {sec.items && (
                <ul className="legal-list">
                  {sec.items.map((item, j) => (
                    <li key={j}>
                      <span>
                        {item.sub && <strong>{item.sub}:</strong>}
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {sec.contact && (
                <a href={`mailto:${sec.contact.email}`} className="legal-contact">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {sec.contact.label}: {sec.contact.email}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
