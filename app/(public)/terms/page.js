'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

const CONTENT = {
  en: {
    heroTitle:    'Terms & Conditions',
    heroSub:      'Last updated: July 2025',
    breadHome:    'Home',
    breadCurrent: 'Terms & Conditions',
    intro: 'Please read these Terms and Conditions carefully before using Grace Academy\'s website or services. By accessing or using our platform you agree to be bound by these terms. If you do not agree, please do not use our services.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By creating an account, booking a session, or otherwise using our services, you confirm that you are at least 18 years old (or have obtained verifiable parental or guardian consent), and that you have read and agree to these Terms and Conditions and our Privacy Policy.',
      },
      {
        title: '2. Use of the Platform',
        items: [
          { text: 'You agree to use our platform only for lawful purposes and in accordance with these Terms.' },
          { text: 'You must not use the platform in any way that could damage, overburden, or impair its availability or accessibility.' },
          { text: 'You must not attempt to gain unauthorised access to any part of the platform, its systems, or networks.' },
          { text: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.' },
        ],
      },
      {
        title: '3. User Accounts',
        items: [
          { sub: 'Registration', text: 'Accurate and complete information must be provided when creating an account. You agree to keep this information up to date.' },
          { sub: 'Account security', text: 'You are solely responsible for any activity that occurs under your account. Notify us immediately of any suspected unauthorised use.' },
          { sub: 'Account suspension', text: 'Grace Academy reserves the right to suspend or terminate any account that violates these Terms, without prior notice.' },
        ],
      },
      {
        title: '4. Placement Assessments',
        items: [
          { text: 'Placement assessment sessions are booked through the student portal and assigned to an available academic consultant.' },
          { text: 'Sessions are conducted via video call. A unique meeting link is generated automatically upon booking and sent to both parties by email.' },
          { text: 'Students are expected to join sessions on time. Late arrivals of more than 15 minutes may result in the session being marked as missed.' },
          { text: 'Each student is entitled to one complimentary placement assessment. Rescheduling requests must be made at least 24 hours in advance.' },
        ],
      },
      {
        title: '5. Payments & Refunds',
        items: [
          { sub: 'Payment', text: 'All fees are displayed in the applicable currency and are due in advance unless otherwise agreed in writing.' },
          { sub: 'Refunds', text: 'Refund requests must be submitted within 7 days of payment. Refunds are not issued for sessions that have already been attended or for missed sessions without 24-hour advance notice.' },
          { sub: 'Disputes', text: 'Payment disputes must be raised with us directly before initiating a chargeback. We commit to resolving genuine disputes within 10 business days.' },
        ],
      },
      {
        title: '6. Intellectual Property',
        body: 'All content on the Grace Academy platform — including course materials, assessments, videos, graphics, and text — is owned by or licensed to Grace Academy and is protected by applicable intellectual property laws. You may not copy, distribute, reproduce, or create derivative works from our content without explicit written permission.',
      },
      {
        title: '7. Academic Consultant Obligations',
        body: 'Academic consultants (assessors) who operate on the platform agree to:',
        items: [
          { text: 'Complete the required onboarding steps, including profile setup and schedule configuration.' },
          { text: 'Attend all confirmed sessions on time and maintain a professional standard of conduct.' },
          { text: 'Keep student information confidential and not share it outside the platform.' },
          { text: 'Update their availability schedule with adequate notice when changes are required.' },
        ],
      },
      {
        title: '8. Limitation of Liability',
        body: 'To the fullest extent permitted by applicable law, Grace Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our services. Our total liability in any matter related to our services is limited to the amount paid by you in the 3 months preceding the claim.',
      },
      {
        title: '9. Third-Party Services',
        body: 'Our platform may integrate with third-party services. These integrations are governed by the respective providers\' terms of service and privacy policies. Grace Academy is not responsible for the availability, accuracy, or conduct of third-party services.',
      },
      {
        title: '10. Disclaimers',
        items: [
          { text: 'Our services are provided "as is" without warranties of any kind, express or implied.' },
          { text: 'We do not guarantee that our platform will be available at all times or free from errors.' },
          { text: 'Learning outcomes vary by individual commitment, consistency, and prior knowledge.' },
        ],
      },
      {
        title: '11. Changes to Terms',
        body: 'Grace Academy reserves the right to modify these Terms at any time. We will provide at least 14 days\' notice of material changes via email or in-platform notification. Continued use of our services after the effective date constitutes acceptance of the revised Terms.',
      },
      {
        title: '12. Governing Law',
        body: 'These Terms are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Riyadh.',
      },
      {
        title: '13. Contact',
        body: 'If you have any questions about these Terms, please contact us at:',
        contact: { email: 'info@graceacademys.com', label: 'Email' },
      },
    ],
  },
  ar: {
    heroTitle:    'الشروط والأحكام',
    heroSub:      'آخر تحديث: يوليو ٢٠٢٥',
    breadHome:    'الرئيسية',
    breadCurrent: 'الشروط والأحكام',
    intro: 'يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام موقع أكاديمية جريس أو خدماتها. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق عليها، يرجى عدم استخدام خدماتنا.',
    sections: [
      {
        title: '١. قبول الشروط',
        body: 'بإنشاء حساب أو حجز جلسة أو استخدام خدماتنا بأي طريقة، فإنك تؤكد أنك تبلغ من العمر 18 عاماً على الأقل (أو حصلت على موافقة موثقة من أحد الوالدين أو الوصي القانوني)، وأنك قرأت هذه الشروط والأحكام وسياسة الخصوصية ووافقت عليها.',
      },
      {
        title: '٢. استخدام المنصة',
        items: [
          { text: 'توافق على استخدام منصتنا للأغراض المشروعة فحسب ووفقاً لهذه الشروط.' },
          { text: 'يحظر عليك استخدام المنصة بأي طريقة قد تضر بتوافرها أو إمكانية الوصول إليها أو تُثقل كاهلها.' },
          { text: 'يحظر عليك محاولة الوصول غير المصرح به إلى أي جزء من المنصة أو أنظمتها أو شبكاتها.' },
          { text: 'أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول وعن جميع الأنشطة التي تجري تحت حسابك.' },
        ],
      },
      {
        title: '٣. حسابات المستخدمين',
        items: [
          { sub: 'التسجيل', text: 'يجب تقديم معلومات دقيقة وكاملة عند إنشاء الحساب، مع الالتزام بتحديثها باستمرار.' },
          { sub: 'أمن الحساب', text: 'أنت المسؤول الوحيد عن أي نشاط يحدث تحت حسابك. أخطرنا فوراً بأي استخدام مشبوه غير مصرح به.' },
          { sub: 'تعليق الحساب', text: 'تحتفظ أكاديمية جريس بالحق في تعليق أي حساب ينتهك هذه الشروط أو إنهائه دون إشعار مسبق.' },
        ],
      },
      {
        title: '٤. جلسات تقييم تحديد المستوى',
        items: [
          { text: 'تُحجز جلسات تقييم تحديد المستوى عبر بوابة الطالب وتُسند إلى مستشار أكاديمي متاح.' },
          { text: 'تُعقد الجلسات عبر مكالمة فيديو. يُنشأ رابط اجتماع فريد تلقائياً عند الحجز ويُرسل إلى الطرفين بالبريد الإلكتروني.' },
          { text: 'يُتوقع من الطلاب الانضمام إلى الجلسات في موعدها. التأخير لأكثر من 15 دقيقة قد يُسجَّل باعتباره غياباً.' },
          { text: 'يحق لكل طالب إجراء تقييم واحد مجاني لتحديد المستوى. يجب تقديم طلبات إعادة الجدولة قبل 24 ساعة على الأقل.' },
        ],
      },
      {
        title: '٥. المدفوعات والاسترداد',
        items: [
          { sub: 'الدفع', text: 'تُعرض جميع الرسوم بالعملة المحددة وتُستحق مسبقاً ما لم يُتفق على خلاف ذلك كتابةً.' },
          { sub: 'الاسترداد', text: 'يجب تقديم طلبات الاسترداد خلال 7 أيام من تاريخ الدفع. لا تُصدر استردادات للجلسات التي حضرها الطالب بالفعل أو للجلسات المفقودة دون إشعار مسبق بـ 24 ساعة.' },
          { sub: 'النزاعات', text: 'يجب رفع نزاعات الدفع إلينا مباشرةً قبل بدء إجراءات استرداد المبالغ عبر البنك. نلتزم بحل النزاعات المشروعة خلال 10 أيام عمل.' },
        ],
      },
      {
        title: '٦. الملكية الفكرية',
        body: 'جميع المحتويات على منصة أكاديمية جريس — بما في ذلك مواد الدورات والتقييمات ومقاطع الفيديو والرسومات والنصوص — مملوكة لأكاديمية جريس أو مرخصة لها، وتحظى بحماية قوانين الملكية الفكرية المعمول بها. لا يجوز لك نسخ أي من هذه المحتويات أو توزيعها أو إعادة إنتاجها أو إنشاء أعمال مشتقة منها دون إذن كتابي صريح.',
      },
      {
        title: '٧. التزامات المستشارين الأكاديميين',
        body: 'يوافق المستشارون الأكاديميون (المقيِّمون) العاملون على المنصة على ما يلي:',
        items: [
          { text: 'إكمال خطوات الإعداد المطلوبة، بما في ذلك إعداد الملف الشخصي وضبط الجدول الزمني.' },
          { text: 'حضور جميع الجلسات المؤكدة في موعدها والحفاظ على مستوى مهني من السلوك.' },
          { text: 'الحفاظ على سرية معلومات الطلاب وعدم مشاركتها خارج المنصة.' },
          { text: 'تحديث جدول توافرهم بإشعار كافٍ عند الحاجة إلى تغييرات.' },
        ],
      },
      {
        title: '٨. تحديد المسؤولية',
        body: 'بالقدر الأقصى الذي يسمح به القانون المعمول به، لن تكون أكاديمية جريس مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية تنشأ عن استخدامك لخدماتنا أو عدم قدرتك على استخدامها. إجمالي مسؤوليتنا في أي مسألة تتعلق بخدماتنا محدود بالمبالغ التي دفعتها خلال الأشهر الثلاثة السابقة للمطالبة.',
      },
      {
        title: '٩. الخدمات التابعة لجهات خارجية',
        body: 'قد تتكامل منصتنا مع خدمات جهات خارجية. تخضع هذه التكاملات لشروط الخدمة وسياسات الخصوصية الخاصة بمزوديها. لا تتحمل أكاديمية جريس المسؤولية عن توافر هذه الخدمات أو دقتها أو سلوكها.',
      },
      {
        title: '١٠. إخلاء المسؤولية',
        items: [
          { text: 'تُقدَّم خدماتنا "كما هي" دون أي ضمانات من أي نوع، صريحة كانت أم ضمنية.' },
          { text: 'لا نضمن أن منصتنا ستكون متاحة في جميع الأوقات أو خالية من الأخطاء.' },
          { text: 'تتفاوت نتائج التعلم بحسب الالتزام الفردي والاتساق والمعرفة السابقة لكل متعلم.' },
        ],
      },
      {
        title: '١١. التغييرات على الشروط',
        body: 'تحتفظ أكاديمية جريس بالحق في تعديل هذه الشروط في أي وقت. سنوفر إشعاراً مسبقاً لا يقل عن 14 يوماً للتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة. استمرارك في استخدام خدماتنا بعد تاريخ السريان يُعدّ قبولاً للشروط المعدَّلة.',
      },
      {
        title: '١٢. القانون الحاكم',
        body: 'تخضع هذه الشروط وتُفسَّر وفقاً لقوانين المملكة العربية السعودية. تخضع أي نزاعات تنشأ عن هذه الشروط للاختصاص القضائي الحصري لمحاكم مدينة الرياض.',
      },
      {
        title: '١٣. تواصل معنا',
        body: 'إذا كانت لديك أي استفسارات حول هذه الشروط، يرجى التواصل معنا على:',
        contact: { email: 'info@graceacademys.com', label: 'البريد الإلكتروني' },
      },
    ],
  },
}

export default function TermsPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const c = CONTENT[lang] || CONTENT.en

  return (
    <>
      <style>{`
        .legal-hero {
          background: linear-gradient(150deg, #061014 0%, #0a1b22 50%, #0f2330 100%);
          padding: 72px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .legal-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(201,147,44,.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(201,147,44,.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .legal-hero__inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 56px;
        }
        .legal-hero__text {
          flex: 1;
          min-width: 0;
          text-align: ${isAr ? 'right' : 'left'};
        }
        .legal-hero__visual {
          flex: 0 0 auto;
          width: clamp(220px, 36vw, 400px);
        }
        .legal-hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: rgba(201,147,44,.12);
          border: 1px solid rgba(201,147,44,.3);
          border-radius: 100px;
          font-size: .68rem;
          font-weight: 800;
          letter-spacing: .12em;
          color: #c9932c;
          margin-bottom: 22px;
        }
        .legal-hero__bread {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: .75rem;
          color: rgba(255,255,255,.35);
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: ${isAr ? 'flex-end' : 'flex-start'};
        }
        .legal-hero__bread a { color: rgba(255,255,255,.35); text-decoration: none; transition: color .15s; }
        .legal-hero__bread a:hover { color: #c9932c; }
        .legal-hero__sep { color: rgba(255,255,255,.2); }
        .legal-hero__title {
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -.02em;
        }
        .legal-hero__title span { color: #c9932c; }
        .legal-hero__sub {
          font-size: .88rem;
          color: rgba(255,255,255,.38);
        }
        .legal-page { padding: 80px 0 120px; }
        .legal-body { max-width: 820px; margin: 0 auto; padding: 0 24px; }
        .legal-intro {
          font-size: 1rem;
          line-height: 1.85;
          color: var(--text-secondary, #4b5563);
          margin: 56px 0 48px;
          padding: 24px 28px;
          background: rgba(201,147,44,.06);
          border-inline-start: 3px solid #c9932c;
          border-radius: 0 10px 10px 0;
        }
        [dir="rtl"] .legal-intro { border-radius: 10px 0 0 10px; }
        .legal-section { margin-bottom: 44px; }
        .legal-section__title {
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--text-primary, #111827);
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        .legal-section__body {
          font-size: .92rem;
          line-height: 1.85;
          color: var(--text-secondary, #4b5563);
          margin-bottom: 14px;
        }
        .legal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .legal-list li {
          display: flex;
          gap: 12px;
          font-size: .92rem;
          line-height: 1.75;
          color: var(--text-secondary, #4b5563);
          align-items: flex-start;
        }
        .legal-list li::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9932c;
          flex-shrink: 0;
          margin-top: 10px;
        }
        .legal-list li strong { color: var(--text-primary, #111827); margin-inline-end: 4px; }
        .legal-contact {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 14px;
          padding: 11px 20px;
          background: rgba(201,147,44,.08);
          border: 1px solid rgba(201,147,44,.28);
          border-radius: 10px;
          font-size: .88rem;
          color: #c9932c;
          font-weight: 700;
          text-decoration: none;
          transition: background .15s, transform .15s;
        }
        .legal-contact:hover { background: rgba(201,147,44,.16); transform: translateY(-1px); }
        @media (max-width: 768px) {
          .legal-hero__inner { flex-direction: column-reverse; gap: 32px; text-align: center; }
          .legal-hero__text { text-align: center; }
          .legal-hero__bread { justify-content: center; }
          .legal-hero__visual { width: clamp(180px, 55vw, 280px); }
          .legal-page { padding: 56px 0 80px; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="legal-hero">
        <div className="container">
          <div className="legal-hero__inner">

            {/* Text side */}
            <div className="legal-hero__text">
              <div className="legal-hero__bread">
                <Link href="/">{c.breadHome}</Link>
                <span className="legal-hero__sep">/</span>
                <span>{c.breadCurrent}</span>
              </div>

              <div className="legal-hero__badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {isAr ? 'الشروط والأحكام' : 'TERMS & CONDITIONS'}
              </div>

              <h1 className="legal-hero__title">
                {isAr ? <>استخدم المنصة<br /><span>بثقة وشفافية</span></> : <>Clear terms,<br /><span>fair agreement.</span></>}
              </h1>

              <p className="legal-hero__sub">{c.heroSub}</p>
            </div>

            {/* SVG side */}
            <div className="legal-hero__visual">
              <img
                src="/images/terms.svg"
                alt="Terms and Conditions"
                style={{ width: '100%', maxWidth: 440, height: 'auto', display: 'block' }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Body ── */}
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
                        {item.sub && <strong>{item.sub}: </strong>}
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
