/* ═══════════════════════════════════════════════
   GRACE ACADEMY — Identity Website
   Language, Interaction, Animations
   ═══════════════════════════════════════════════ */

/* ─── Translation Data ─── */
const translations = {
    en: {
        _lang: 'en', _dir: 'ltr', _toggleLabel: 'العربية',
        _docTitle: 'Grace Academy — Long Live Learn',

        brandName:    'GRACE',
        navHome:      'Home',
        navAbout:     'About',
        navServices:  'Services',
        navPortfolio: 'Portfolio',
        navBlog:      'Blog',
        navFaq:       'FAQ',
        navPricing:   'Pricing',
        navCourses:   'Courses',
        navAudience:  "Who We're For",
        navContact:   'Get Started',

        heroSubtitle: 'A complete English learning ecosystem built for every age — conversational, business, technical, and beyond.',
        heroCta1:     'Explore Courses',
        heroCta2:     'Our Vision',

        stripText1:   'Not just education.',
        stripText2:   'A lifestyle.',
        stripText3:   '24/7 consecutive growth.',
        stripText4:   'Long Live Learn.',

        aboutLabel:   'About Grace Academy',
        aboutTitle:   'A Different Idea of Learning',
        aboutLead:    'We are a team dedicated to creating not only a course or language training — but a complete environment aiming to build a lifestyle.',
        aboutBody:    'We introduce a different idea of living the learning experience. Not just education — an entire system created only for consecutive growth 24/7, not just 1 or 2 hours of learning.',
        pillar1Title: 'Complete Environment',
        pillar1Body:  'An immersive learning ecosystem beyond the classroom',
        pillar2Title: '24/7 Growth System',
        pillar2Body:  'Continuous progress, not scheduled sessions',
        pillar3Title: 'Lifestyle Approach',
        pillar3Body:  'English as a way of life, not a subject to study',

        stat2word:    'All',
        stat1:        'Course Types',
        stat2:        'Age Groups',
        stat3:        'Learning System',
        stat4:        'Ecosystem',

        manifesto:    '"We did not come to teach the English language — we came to build a world where learning never stops."',

        coursesLabel:    'What We Teach',
        coursesTitle:    'Every Type of English',
        coursesSubtitle: 'From your first word to your boardroom presentation — we have the path for you.',
        course1Title:    'Conversational English',
        course1Body:     'Build fluency and confidence in real-world everyday communication.',
        tagAllLevels:    'All Levels',
        course2Title:    'Business English',
        course2Body:     'Professional communication for meetings, emails, negotiations, and leadership.',
        tagProfessional: 'Professional',
        course3Title:    'Technical English',
        course3Body:     'Specialized vocabulary and communication for engineering, IT, and sciences.',
        tagSpecialized:  'Specialized',
        course4Title:    'Academic English',
        course4Body:     'Research writing, critical thinking, and academic discourse for students.',
        tagAcademic:     'Academic',
        course5Title:    'Kids & Young Learners',
        course5Body:     'Engaging, playful programs that build strong English foundations from an early age.',
        tagKids:         'Ages 6–17',
        course6Title:    'Exam Preparation',
        course6Body:     'Targeted training for IELTS, TOEFL, Cambridge, and other international certifications.',
        tagExam:         'IELTS · TOEFL · Cambridge',

        audienceLabel: 'Built for Everyone',
        audienceTitle: 'Every Age. Every Goal.',
        aud1Title:     'Young Explorers',
        aud1Body:      'Fun, story-based learning that sparks a love for English through games and creativity.',
        aud2Title:     'Teens & Students',
        aud2Body:      'Academic skills, social fluency, and exam preparation for confident young learners.',
        aud3Title:     'Young Adults',
        aud3Body:      'University, career, and international life preparation for the next generation.',
        aud4Title:     'Professionals',
        aud4Body:      'Business, technical, and leadership English for career growth and global communication.',

        expLabel:  'The Grace Experience',
        expTitle:  'More Than a Classroom',
        expText:   "At Grace Academy, we believe language learning is not an event — it's a transformation. Our ecosystem wraps around your life, making English a natural part of how you think, work, and grow every single day.",
        expF1:     'Immersive Learning Paths',
        expF2:     'Community & Practice Groups',
        expF3:     'Expert Native Instructors',
        expF4:     'Progress Tracking & Goals',
        expF5:     'Flexible Schedules',
        expF6:     'Real-World Applications',

        ctaTitle:       'Begin Your Journey',
        ctaSubtitle:    'Join the Grace Academy ecosystem. Let English become your lifestyle.',
        ctaPlaceholder: 'Enter your email address',
        ctaBtn:         'Get Started',
        ctaTagline:     'Long Live Learn',

        footerMotto:   'Long Live Learn',
        footerCourses: 'Courses',
        footerConvo:   'Conversational',
        footerBusiness:'Business',
        footerTech:    'Technical',
        footerAcademic:'Academic',
        footerCompany: 'Academy',
        footerAbout:   'About',
        footerWhoFor:  "Who We're For",
        footerContact: 'Contact',
        footerCopy:    '© 2025 Grace Academy. All rights reserved.',
        footerDev:     'Developed by',
    },

    ar: {
        _lang: 'ar', _dir: 'rtl', _toggleLabel: 'English',
        _docTitle: 'أكاديمية جريس — يحيا التعلم',

        brandName:    'جريس',
        navHome:      'الرئيسية',
        navAbout:     'عنّا',
        navServices:  'الخدمات',
        navPortfolio: 'أعمالنا',
        navBlog:      'المدونة',
        navFaq:       'الأسئلة الشائعة',
        navPricing:   'الأسعار',
        navCourses:   'الدورات',
        navAudience:  'لمن نحن',
        navContact:   'ابدأ الآن',

        heroSubtitle: 'منظومة تعليمية متكاملة للغة الإنجليزية مبنية لكل الأعمار — تحادثية، وأعمال، وتقنية، وأكثر.',
        heroCta1:     'استكشف الدورات',
        heroCta2:     'رؤيتنا',

        stripText1:   'ليس مجرد تعليم.',
        stripText2:   'أسلوب حياة.',
        stripText3:   'نمو متواصل على مدار الساعة.',
        stripText4:   'يحيا التعلم.',

        aboutLabel:   'عن أكاديمية جريس',
        aboutTitle:   'فكرة مختلفة للتعلم',
        aboutLead:    'نحن فريق متفانٍ ليس فقط لإنشاء دورات أو تدريب لغوي — بل لخلق بيئة متكاملة تهدف إلى بناء أسلوب حياة.',
        aboutBody:    'نقدم فكرة مختلفة لمعيشة تجربة التعلم. ليس مجرد تعليم — بل نظام متكامل تم إنشاؤه فقط للنمو المتواصل على مدار الساعة، وليس مجرد ساعة أو ساعتين من التعلم.',
        pillar1Title: 'بيئة متكاملة',
        pillar1Body:  'منظومة تعليمية غامرة تتجاوز حدود الفصل الدراسي',
        pillar2Title: 'نظام نمو على مدار الساعة',
        pillar2Body:  'تقدم مستمر، وليس جلسات مجدولة',
        pillar3Title: 'نهج أسلوب الحياة',
        pillar3Body:  'الإنجليزية كأسلوب حياة، وليست مادة للدراسة',

        stat2word:    'الكل',
        stat1:        'أنواع الدورات',
        stat2:        'الفئات العمرية',
        stat3:        'نظام التعلم',
        stat4:        'منظومة',

        manifesto:    '"لم نأتِ لتعليم اللغة الإنجليزية فحسب — جئنا لبناء عالمٍ لا يتوقف فيه التعلم."',

        coursesLabel:    'ماذا نعلّم',
        coursesTitle:    'كل أنواع الإنجليزية',
        coursesSubtitle: 'من كلمتك الأولى حتى عرضك في مجلس الإدارة — لدينا المسار المناسب لك.',
        course1Title:    'الإنجليزية التحادثية',
        course1Body:     'بناء الطلاقة والثقة في التواصل اليومي الواقعي.',
        tagAllLevels:    'جميع المستويات',
        course2Title:    'إنجليزية الأعمال',
        course2Body:     'التواصل المهني للاجتماعات والبريد الإلكتروني والمفاوضات والقيادة.',
        tagProfessional: 'مهني',
        course3Title:    'الإنجليزية التقنية',
        course3Body:     'مفردات وتواصل متخصص للهندسة وتقنية المعلومات والعلوم.',
        tagSpecialized:  'متخصص',
        course4Title:    'الإنجليزية الأكاديمية',
        course4Body:     'الكتابة البحثية والتفكير النقدي والخطاب الأكاديمي للطلاب.',
        tagAcademic:     'أكاديمي',
        course5Title:    'الأطفال والمتعلمون الصغار',
        course5Body:     'برامج جذابة وممتعة تبني أسساً قوية في الإنجليزية منذ سن مبكرة.',
        tagKids:         'من 6 إلى 17 سنة',
        course6Title:    'التحضير للامتحانات',
        course6Body:     'تدريب موجه لـ IELTS وTOEFL وكامبريدج وغيرها من الشهادات الدولية.',
        tagExam:         'IELTS · TOEFL · كامبريدج',

        audienceLabel: 'مبني للجميع',
        audienceTitle: 'كل عمر. كل هدف.',
        aud1Title:     'المستكشفون الصغار',
        aud1Body:      'تعلم ممتع قائم على القصص يُشعل حب الإنجليزية من خلال الألعاب والإبداع.',
        aud2Title:     'المراهقون والطلاب',
        aud2Body:      'المهارات الأكاديمية والطلاقة الاجتماعية والتحضير للامتحانات للمتعلمين الشباب.',
        aud3Title:     'الشباب',
        aud3Body:      'التحضير للجامعة والمهنة والحياة الدولية للجيل القادم.',
        aud4Title:     'المحترفون',
        aud4Body:      'إنجليزية الأعمال والتقنية والقيادة للنمو الوظيفي والتواصل العالمي.',

        expLabel:  'تجربة جريس',
        expTitle:  'أكثر من مجرد فصل دراسي',
        expText:   'في أكاديمية جريس، نؤمن بأن تعلم اللغة ليس حدثاً عابراً — بل هو تحول حقيقي. منظومتنا تلتف حول حياتك، مما يجعل اللغة الإنجليزية جزءاً طبيعياً من طريقة تفكيرك وعملك ونموك كل يوم.',
        expF1:     'مسارات تعليمية غامرة',
        expF2:     'مجتمع ومجموعات تدريب',
        expF3:     'مدربون متخصصون أصليون',
        expF4:     'تتبع التقدم والأهداف',
        expF5:     'جداول مرنة',
        expF6:     'تطبيقات من الحياة الواقعية',

        ctaTitle:       'ابدأ رحلتك',
        ctaSubtitle:    'انضم إلى منظومة أكاديمية جريس. دع الإنجليزية تصبح أسلوب حياتك.',
        ctaPlaceholder: 'أدخل عنوان بريدك الإلكتروني',
        ctaBtn:         'ابدأ الآن',
        ctaTagline:     'يحيا التعلم',

        footerMotto:   'يحيا التعلم',
        footerCourses: 'الدورات',
        footerConvo:   'التحادثية',
        footerBusiness:'الأعمال',
        footerTech:    'التقنية',
        footerAcademic:'الأكاديمية',
        footerCompany: 'الأكاديمية',
        footerAbout:   'عنّا',
        footerWhoFor:  'لمن نحن',
        footerContact: 'تواصل معنا',
        footerCopy:    '© 2025 أكاديمية جريس. جميع الحقوق محفوظة.',
        footerDev:     'تطوير بواسطة',
    }
};

/* ─── State ─── */
let currentLang = 'en';
let currentTheme = 'dark';

/* ─── Apply translations ─── */
function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    const html = document.documentElement;
    html.lang = t._lang;
    html.dir  = t._dir;
    document.title = t._docTitle;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    const label = document.getElementById('langLabel');
    if (label) label.textContent = t._toggleLabel;

    /* Update Tajawal for body text in Arabic */
    document.body.style.fontFamily = lang === 'ar'
        ? "'Tajawal', sans-serif"
        : "'Gotham', 'Montserrat', sans-serif";

    currentLang = lang;
}

/* ─── Theme ─── */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ga-theme', theme);
    document.getElementById('themeToggle').setAttribute(
        'aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    currentTheme = theme;
}

function toggleTheme() {
    document.body.style.transition = 'background 0.25s ease, color 0.25s ease';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    setTimeout(() => { document.body.style.transition = ''; }, 280);
}

/* Restore from storage, fall back to system preference */
(function initTheme() {
    const stored = localStorage.getItem('ga-theme');
    if (stored) {
        applyTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    }
})();

/* ─── Toggle with fade ─── */
function toggleLanguage() {
    document.body.style.transition = 'opacity 0.18s ease';
    document.body.style.opacity    = '0';
    setTimeout(() => {
        applyTranslations(currentLang === 'en' ? 'ar' : 'en');
        document.body.style.opacity = '1';
    }, 180);
}

/* ─── Scroll: navbar + progress bar + parallax ─── */
const navbar         = document.getElementById('navbar');
const progressBar    = document.getElementById('scrollProgress');
const heroLogoWrap   = document.querySelector('.hero__logo-wrap');
const heroSection    = document.querySelector('.hero');
const manifestoQuote = document.querySelector('.manifesto__quote');

let rafId = null;

function onScroll() {
    const y    = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    /* Navbar */
    navbar.classList.toggle('scrolled', y > 60);

    /* Scroll progress bar */
    if (progressBar && docH > 0) {
        progressBar.style.transform = `scaleX(${y / docH})`;
    }

    /* Hero logo parallax — drifts right as you scroll */
    if (heroLogoWrap && heroSection) {
        const heroH = heroSection.offsetHeight;
        if (y < heroH) {
            const shift = y * 0.09;
            heroLogoWrap.style.transform = `translateX(${shift}px)`;
        }
    }

    /* Manifesto subtle parallax */
    if (manifestoQuote) {
        const rect  = manifestoQuote.closest('.manifesto').getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height + window.innerHeight)));
        manifestoQuote.style.transform = `translateY(${(ratio - 0.5) * -24}px)`;
    }
}

window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(onScroll);
}, { passive: true });

/* Run once on load to initialise progress bar */
onScroll();

/* ─── Mobile menu ─── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

/* ─── Theme toggle ─── */
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

/* ─── Language toggle ─── */
document.getElementById('langToggle').addEventListener('click', toggleLanguage);

/* ─── Stagger grid children before reveal ─── */
const staggerConfigs = [
    { selector: '.courses__grid [data-reveal]',  baseDelay: 80  },
    { selector: '.audience__grid [data-reveal]', baseDelay: 100 },
];
staggerConfigs.forEach(({ selector, baseDelay }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
        el.style.transitionDelay = `${i * baseDelay}ms`;
    });
});

/* ─── Scroll reveal ─── */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => el.classList.add('revealed'), delay);
        revealObserver.unobserve(el);
    });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ─── Animated counters (stats section) ─── */
function animateCount(el, target, duration = 1200) {
    let start = null;
    const step = ts => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    };
    requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCount(el, target);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ─── Smooth active nav link highlight ─── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
            const matches = link.getAttribute('href') === '#' + id;
            link.style.color = matches ? 'var(--text)' : '';
        });
    });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ─── CTA email placeholder submit ─── */
document.querySelector('.cta__form .btn--primary')?.addEventListener('click', () => {
    const input = document.querySelector('.cta__input');
    const val   = input?.value?.trim();
    if (!val || !val.includes('@')) {
        input?.focus();
        input?.style && (input.style.borderColor = 'var(--gold)');
        return;
    }
    const btn = document.querySelector('.cta__form .btn--primary');
    btn.textContent = currentLang === 'ar' ? 'شكراً لك! ✓' : 'Thank you! ✓';
    btn.style.background = '#2d6e3e';
    btn.style.borderColor = '#2d6e3e';
    input.value = '';
    setTimeout(() => {
        btn.textContent = currentLang === 'ar'
            ? translations.ar.ctaBtn
            : translations.en.ctaBtn;
        btn.style.background = '';
        btn.style.borderColor = '';
    }, 3000);
});
