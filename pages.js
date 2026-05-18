/* ============================================================
   GRACE ACADEMY — INNER PAGES SHARED JS
   Handles: translations (EN/AR), theme, scroll FX,
            reveal, counters, FAQ accordion, contact form
   DO NOT TOUCH index.html / styles.css / script.js
   ============================================================ */

/* ── Translations ───────────────────────────────────────────── */
const translations = {
  en: {
    /* Nav */
    navHome:      'Home',
    navAbout:     'About',
    navServices:  'Services',
    navPortfolio: 'Portfolio',
    navBlog:      'Blog',
    navFaq:       'FAQ',
    navPricing:   'Pricing',
    navContact:   'Get Started',

    /* Footer */
    footerTagline:   'Learn English. Live it.',
    footerMotto:     'Long Live Learn',
    footerCourses:   'Courses',
    footerConvo:     'Conversational',
    footerBusiness:  'Business',
    footerTech:      'Technical',
    footerAcademic:  'Academic',
    footerCompany:   'Academy',
    footerAbout:     'About',
    footerWhoFor:    "Who We're For",
    footerContact:   'Contact',
    footerCopy:      '© 2025 Grace Academy. All rights reserved.',
    footerDev:       'Developed by',
    footerDevBy:     'Developed by',
    footerPagesCol:  'Pages',
    footerAcademyCol:'Academy',
    footerHome:      'Home',
    footerPortfolio: 'Portfolio',
    footerBlog:      'Blog',
    footerFaq:       'FAQ',
    footerPricing:   'Pricing',

    /* Stats section (all pages) */
    statsTitle:       'Grace Academy in Numbers',
    statsSub:         'Building impact one learner at a time',
    statsReviews:     'Happy Reviews',
    statsStudents:    'Active Students',
    statsCourses:     'Available Courses',
    statsInstructors: 'Expert Instructors',

    /* ── About ─────────────────────────────────────────── */
    aboutHeroTitle:  'Our <span>Story</span>',
    aboutHeroSub:    'Two decades of transforming lives through the English language.',
    aboutBreadHome:  'Home',
    aboutBreadCurrent:'About',

    storyLabel:  'Who We Are',
    storyTitle:  'More than a school — a lifestyle',
    storyP1:     'Grace Academy was founded on a single belief: learning English should not be confined to a classroom. Real fluency comes from living the language every day, in every conversation, at every opportunity.',
    storyP2:     'Since our founding we have guided thousands of students from complete beginners to confident, articulate speakers ready to compete on a global stage.',
    storyP3:     'Our approach blends structured curriculum with authentic, real-world immersion so that progress never stops at the academy door.',

    mvLabel:         'Core Principles',
    mvTitle:         'Mission & Vision',
    missionTitle:    'Our Mission',
    missionBody:     'To empower Arabic-speaking learners of all ages with world-class English language education — delivered through engaging, practical, and lifestyle-integrated methods that build genuine fluency.',
    visionTitle:     'Our Vision',
    visionBody:      'To be the leading English language learning platform across the Arab world, recognised for measurable outcomes, innovative pedagogy, and a community that never stops growing.',

    whyLabel:   'Why Choose Us',
    whyTitle:   'What sets Grace Academy apart',
    why1Title:  '24/7 Lifestyle Learning',
    why1Body:   'English doesn\'t clock out. Our resources, coaches, and community are available around the clock to support your journey.',
    why2Title:  'All Ages & Levels',
    why2Body:   'From kindergarten kids to senior executives — our programmes are tailored to every age group and proficiency level.',
    why3Title:  'Native-Level Instructors',
    why3Body:   'Every instructor is rigorously vetted, trained in communicative methods, and passionate about student success.',
    why4Title:  'Proven Results',
    why4Body:   'Thousands of graduates have passed IELTS, TOEFL, and Cambridge exams — and gone on to global careers.',
    why5Title:  'Flexible Schedules',
    why5Body:   'Morning, evening, weekend, or self-paced: learn on a schedule that fits your life, not the other way around.',
    why6Title:  'Global Community',
    why6Body:   'Join a thriving network of learners who collaborate, practise, and motivate each other every single day.',

    teamLabel: 'Meet the Team',
    teamTitle: 'The people behind Grace Academy',
    team1Name: 'Sara Al-Hassan',
    team1Role: 'Founder & Director',
    team2Name: 'James Whitfield',
    team2Role: 'Head of Curriculum',
    team3Name: 'Layla Mansour',
    team3Role: 'Senior Instructor',
    team4Name: 'Omar Khalid',
    team4Role: 'Student Success Lead',

    /* ── Services ──────────────────────────────────────── */
    servicesHeroTitle:   'Our <span>Programmes</span>',
    servicesHeroSub:     'A complete suite of English learning programmes for every goal and every stage of life.',
    servicesBreadCurrent:'Services',

    servicesLabel: 'What We Offer',
    servicesTitle: 'English for every purpose',

    svc1Title: 'Conversational English',
    svc1Body:  'Break the fear of speaking. Build real-world fluency through guided conversations, role-play, and live discussion sessions.',
    svc1Tag:   'All Levels',
    svc2Title: 'Business English',
    svc2Body:  'Professional vocabulary, email writing, presentations, negotiations, and workplace communication for career growth.',
    svc2Tag:   'Intermediate+',
    svc3Title: 'Academic & Exam Prep',
    svc3Body:  'Targeted preparation for IELTS, TOEFL, Cambridge, and SAT with mock exams, expert feedback, and proven strategies.',
    svc3Tag:   'IELTS / TOEFL',
    svc4Title: 'Kids & Young Learners',
    svc4Body:  'Age-appropriate, play-based English learning that builds vocabulary, reading, and confidence from an early age.',
    svc4Tag:   'Ages 5 – 15',
    svc5Title: 'Technical English',
    svc5Body:  'Specialised language for engineering, IT, medicine, and law — field-specific vocabulary and professional writing.',
    svc5Tag:   'Professionals',
    svc6Title: 'Corporate Training',
    svc6Body:  'Bespoke in-company programmes that upskill entire teams with flexible delivery, from on-site workshops to live online.',
    svc6Tag:   'Organisations',

    processLabel: 'How It Works',
    processTitle: 'Your journey from enrolment to fluency',
    step1Title: 'Placement Assessment',
    step1Body:  'A quick diagnostic test accurately places you in the right level from day one.',
    step2Title: 'Personalised Plan',
    step2Body:  'Your dedicated advisor builds a learning path tailored to your goals and schedule.',
    step3Title: 'Live Learning',
    step3Body:  'Attend interactive live sessions with expert instructors and fellow learners worldwide.',
    step4Title: 'Track & Progress',
    step4Body:  'Regular assessments and progress reports keep you motivated and on course.',

    /* ── Portfolio ─────────────────────────────────────── */
    portfolioHeroTitle:   'Student <span>Success Stories</span>',
    portfolioHeroSub:     'Real outcomes from real learners — every project represents a life transformed.',
    portfolioBreadCurrent:'Portfolio',

    portfolioLabel: 'Case Studies',
    portfolioTitle: 'Learning that delivers results',

    proj1Cat:     'IELTS Preparation',
    proj1Title:   'From Band 5 to Band 8 in 6 Months',
    proj1Problem: 'Student struggled with academic writing and reading comprehension.',
    proj1Solution:'Intensive IELTS track with daily writing workshops and timed reading drills.',
    proj1Result:  'Achieved Band 8 overall — secured full scholarship to UK university.',

    proj2Cat:     'Business English',
    proj2Title:   'Executive Communication Transformation',
    proj2Problem: 'Senior manager lacked confidence in English presentations and negotiations.',
    proj2Solution:'12-week Business English programme with executive coaching sessions.',
    proj2Result:  'Promoted to regional director; leads international client calls weekly.',

    proj3Cat:     'Kids Programme',
    proj3Title:   'Zero to Conversational at Age 9',
    proj3Problem: 'Child had zero English exposure and severe anxiety about speaking.',
    proj3Solution:'Play-based immersion programme with weekly 1-on-1 coaching.',
    proj3Result:  'Confidently holds full conversations; top of class in school English.',

    proj4Cat:     'Corporate Training',
    proj4Title:   'Company-Wide English Upskilling',
    proj4Problem: 'Tech company needed employees to communicate with global clients.',
    proj4Solution:'Bespoke 3-month corporate programme with department-specific modules.',
    proj4Result:  '94% of staff rated confident in English; client satisfaction up 40%.',

    proj5Cat:     'Conversational English',
    proj5Title:   'University Graduate to Global Hire',
    proj5Problem: 'Graduate had strong grammar but froze in real conversations.',
    proj5Solution:'Immersive speaking club with daily challenges and peer accountability.',
    proj5Result:  'Landed role at multinational — passed English interview on first attempt.',

    proj6Cat:     'TOEFL Prep',
    proj6Title:   'TOEFL 115 — Ivy League Admission',
    proj6Problem: 'Student needed 110+ TOEFL score for Ivy League graduate programme.',
    proj6Solution:'Structured TOEFL bootcamp with three full mock exams and detailed review.',
    proj6Result:  'Scored 115; admitted to target programme with partial funding.',

    projProblem:  'Challenge:',
    projSolution: 'Approach:',
    projResult:   'Outcome:',

    /* ── Contact ───────────────────────────────────────── */
    contactHeroTitle:   'Get in <span>Touch</span>',
    contactHeroSub:     'Ready to start your English journey? We\'d love to hear from you.',
    contactBreadCurrent:'Contact',

    contactFormTitle: 'Send us a message',
    labelName:        'Full Name',
    labelEmail:       'Email Address',
    labelPhone:       'Phone Number',
    labelMessage:     'Your Message',
    placeholderName:  'Your full name',
    placeholderEmail: 'your@email.com',
    placeholderPhone: '+966 5xx xxx xxxx',
    placeholderMsg:   'Tell us about your goals and how we can help…',
    btnSend:          'Send Message',
    formSuccessMsg:   'Thank you! We\'ll be in touch within 24 hours.',

    contactInfoTitle:   'Contact Information',
    contactAddr:        'Address',
    contactAddrVal:     'Riyadh, Saudi Arabia',
    contactEmailLabel:  'Email',
    contactEmailVal:    'hello@graceacademy.sa',
    contactPhoneLabel:  'Phone',
    contactPhoneVal:    '+966 11 234 5678',
    contactHoursLabel:  'Hours',
    contactHoursVal:    'Sun – Thu, 8 am – 9 pm',
    mapLabel:           'Location map coming soon',
    socialTitle:        'Follow us',

    /* ── FAQ ───────────────────────────────────────────── */
    faqHeroTitle:   'Frequently Asked <span>Questions</span>',
    faqHeroSub:     'Everything you need to know before you begin.',
    faqBreadCurrent:'FAQ',

    faqLabel: 'FAQ',
    faqTitle: 'Answers to common questions',

    faq1Q: 'What age groups do you teach?',
    faq1A: 'We teach everyone — from children as young as 5 to seniors in their 60s. Each programme is tailored to its age group\'s learning style and vocabulary needs.',

    faq2Q: 'Do I need any prior English knowledge to join?',
    faq2A: 'Not at all. We have complete beginner programmes designed from zero. A placement test at enrolment ensures you start at exactly the right level.',

    faq3Q: 'Are classes online, in-person, or both?',
    faq3A: 'We offer fully online live sessions, in-centre classes in Riyadh, and hybrid options. You choose the format that fits your lifestyle.',

    faq4Q: 'How long until I see real progress?',
    faq4A: 'Most students notice a meaningful improvement in confidence and comprehension within 4–6 weeks of consistent study. Significant fluency gains typically appear at the 3–6 month mark.',

    faq5Q: 'What exams do you prepare students for?',
    faq5A: 'IELTS (Academic & General), TOEFL iBT, Cambridge B2 First / C1 Advanced, OET (medical), and SAT English. Our exam-prep track has a 92% pass rate.',

    faq6Q: 'Can my company book corporate training?',
    faq6A: 'Yes. We offer bespoke on-site and online corporate programmes for teams of 5 to 500+. Contact us for a free needs analysis and custom quote.',

    faq7Q: 'What is the maximum class size?',
    faq7A: 'Group classes are capped at 8 students to ensure every learner gets individual attention. One-to-one and small-group (2–3) sessions are also available.',

    faq8Q: 'Is there a trial class available?',
    faq8A: 'Yes! Every new student is welcome to attend one free trial session before committing. Book yours through the Contact page.',

    /* ── Pricing ───────────────────────────────────────── */
    pricingHeroTitle:   'Simple, Transparent <span>Pricing</span>',
    pricingHeroSub:     'Choose the plan that fits your goals — upgrade or cancel any time.',
    pricingBreadCurrent:'Pricing',

    pricingLabel: 'Plans',
    pricingTitle: 'Invest in your English journey',
    pricingNote:  'All plans include a free placement assessment. Prices shown per month.',

    plan1Name:   'Starter',
    plan1Desc:   'Perfect for beginners and casual learners who want to build a solid foundation at their own pace.',
    plan1Price:  '49',
    plan1F1:     '4 group sessions / month',
    plan1F2:     'Self-paced e-learning access',
    plan1F3:     'Progress tracking dashboard',
    plan1F4:     'Community forum access',
    plan1F5:     'Exam preparation modules',
    plan1F6:     'One-to-one coaching',
    plan1CTA:    'Get Started',

    plan2Badge:  'Most Popular',
    plan2Name:   'Professional',
    plan2Desc:   'For motivated learners who want structured guidance, regular coaching, and measurable results.',
    plan2Price:  '129',
    plan2F1:     '12 group sessions / month',
    plan2F2:     'Self-paced e-learning access',
    plan2F3:     'Progress tracking dashboard',
    plan2F4:     'Community forum access',
    plan2F5:     'Exam preparation modules',
    plan2F6:     '2 one-to-one sessions / month',
    plan2CTA:    'Start Free Trial',

    plan3Name:   'Elite',
    plan3Desc:   'Maximum intensity for professionals, exam candidates, or anyone who wants the fastest possible progress.',
    plan3Price:  '249',
    plan3F1:     'Unlimited group sessions',
    plan3F2:     'Self-paced e-learning access',
    plan3F3:     'Progress tracking dashboard',
    plan3F4:     'Priority community support',
    plan3F5:     'Full exam preparation suite',
    plan3F6:     '8 one-to-one sessions / month',
    plan3CTA:    'Go Elite',

    /* ── Blog ──────────────────────────────────────────── */
    blogHeroTitle:   'Grace Academy <span>Blog</span>',
    blogHeroSub:     'Tips, strategies, and stories from the world of English language learning.',
    blogBreadCurrent:'Blog',

    blogLabel: 'Latest Articles',
    blogTitle: 'Learn beyond the classroom',

    blog1Cat:     'Learning Tips',
    blog1Date:    'April 2025',
    blog1Title:   '10 Habits of Highly Fluent English Speakers',
    blog1Excerpt: 'Fluency isn\'t a destination — it\'s a daily practice. Discover the ten habits our most successful students share.',

    blog2Cat:     'Exam Prep',
    blog2Date:    'March 2025',
    blog2Title:   'IELTS Writing Task 2: The Complete 2025 Guide',
    blog2Excerpt: 'Everything you need to know about structuring a band-9-worthy academic essay from introduction to conclusion.',

    blog3Cat:     'Success Story',
    blog3Date:    'March 2025',
    blog3Title:   'How Layla Went from B1 to C2 in Under a Year',
    blog3Excerpt: 'A candid interview with one of our standout students about the mindset shifts that made all the difference.',

    blog4Cat:     'Pronunciation',
    blog4Date:    'February 2025',
    blog4Title:   'Why Your Accent Is an Asset, Not a Barrier',
    blog4Excerpt: 'Native-like pronunciation is rarely necessary for global communication. Here\'s what actually matters — and how to improve it.',

    blog5Cat:     'Vocabulary',
    blog5Date:    'February 2025',
    blog5Title:   'The 500 Words That Cover 90 % of Everyday English',
    blog5Excerpt: 'Building a high-frequency core vocabulary is the fastest path to functional fluency. We break down the research.',

    blog6Cat:     'Kids & Parents',
    blog6Date:    'January 2025',
    blog6Title:   'How to Build an English-Rich Home Environment',
    blog6Excerpt: 'Parents are the most powerful teachers. Practical ideas for weaving English naturally into your family\'s daily life.',

    readMore: 'Read more',
  },

  ar: {
    /* Nav */
    navHome:      'الرئيسية',
    navAbout:     'من نحن',
    navServices:  'الخدمات',
    navPortfolio: 'أعمالنا',
    navBlog:      'المدونة',
    navFaq:       'الأسئلة الشائعة',
    navPricing:   'الأسعار',
    navContact:   'ابدأ الآن',

    /* Footer */
    footerTagline:   'تعلَّم الإنجليزية. عِشها.',
    footerMotto:     'يحيا التعلم',
    footerCourses:   'الدورات',
    footerConvo:     'تحادثي',
    footerBusiness:  'أعمال',
    footerTech:      'تقني',
    footerAcademic:  'أكاديمي',
    footerCompany:   'الأكاديمية',
    footerAbout:     'عنّا',
    footerWhoFor:    'لمن نحن',
    footerContact:   'تواصل معنا',
    footerCopy:      '© 2025 أكاديمية غريس. جميع الحقوق محفوظة.',
    footerDev:       'طُوِّر بواسطة',
    footerDevBy:     'طُوِّر بواسطة',
    footerPagesCol:  'الصفحات',
    footerAcademyCol:'الأكاديمية',
    footerHome:      'الرئيسية',
    footerPortfolio: 'أعمالنا',
    footerBlog:      'المدونة',
    footerFaq:       'الأسئلة الشائعة',
    footerPricing:   'الأسعار',

    /* Stats */
    statsTitle:       'أكاديمية غريس في أرقام',
    statsSub:         'نبني الأثر متعلماً تلو الآخر',
    statsReviews:     'تقييم إيجابي',
    statsStudents:    'طالب نشط',
    statsCourses:     'مسار متاح',
    statsInstructors: 'مدرب متخصص',

    /* ── About ─────────────────────────────────────────── */
    aboutHeroTitle:   'قصتنا <span>ورحلتنا</span>',
    aboutHeroSub:     'عقدان من تحويل الحياة عبر اللغة الإنجليزية.',
    aboutBreadHome:   'الرئيسية',
    aboutBreadCurrent:'من نحن',

    storyLabel:  'من نحن',
    storyTitle:  'أكثر من مدرسة — أسلوب حياة',
    storyP1:     'تأسست أكاديمية غريس على قناعة واحدة: تعلُّم الإنجليزية لا يجب أن يُحصر في قاعة دراسية. الطلاقة الحقيقية تأتي من عيش اللغة يومياً في كل محادثة وفي كل فرصة.',
    storyP2:     'منذ تأسيسنا أرشدنا آلاف الطلاب من المستوى الصفري إلى مستوى المتحدث الواثق القادر على المنافسة على الصعيد العالمي.',
    storyP3:     'مقاربتنا تجمع بين المنهج المنظَّم والانغماس الحقيقي في العالم الحقيقي حتى لا يتوقف التقدم عند باب الأكاديمية.',

    mvLabel:      'المبادئ الأساسية',
    mvTitle:      'رسالتنا ورؤيتنا',
    missionTitle: 'رسالتنا',
    missionBody:  'تمكين المتعلمين الناطقين بالعربية من جميع الأعمار من التعليم اللغوي الإنجليزي العالمي — من خلال أساليب عملية وجذابة ومدمجة في الحياة اليومية تبني طلاقة حقيقية.',
    visionTitle:  'رؤيتنا',
    visionBody:   'أن نكون المنصة الرائدة لتعلُّم اللغة الإنجليزية في العالم العربي، معروفين بنتائج قابلة للقياس وأساليب تربوية مبتكرة ومجتمع لا يتوقف عن النمو.',

    whyLabel:   'لماذا تختارنا',
    whyTitle:   'ما يميز أكاديمية غريس',
    why1Title:  'تعلُّم على مدار الساعة',
    why1Body:   'الإنجليزية لا تتوقف. مواردنا ومدربونا ومجتمعنا متاحون على مدار الساعة لدعم رحلتك.',
    why2Title:  'لجميع الأعمار والمستويات',
    why2Body:   'من أطفال الروضة إلى المديرين التنفيذيين — برامجنا مصممة لكل فئة عمرية ومستوى إتقان.',
    why3Title:  'مدربون على مستوى الناطقين',
    why3Body:   'كل مدرب مُختار بعناية ومدرَّب على الأساليب التواصلية وشغوف بنجاح الطالب.',
    why4Title:  'نتائج مُثبَتة',
    why4Body:   'آلاف الخريجين اجتازوا IELTS وTOEFL وكامبريدج وانطلقوا في مسارات مهنية عالمية.',
    why5Title:  'جداول مرنة',
    why5Body:   'صباحاً أو مساءً أو في عطلة نهاية الأسبوع أو بالسرعة الذاتية: تعلَّم وفق جدول يناسب حياتك.',
    why6Title:  'مجتمع عالمي',
    why6Body:   'انضم إلى شبكة مزدهرة من المتعلمين الذين يتعاونون ويتدربون ويحفز بعضهم بعضاً كل يوم.',

    teamLabel: 'تعرَّف على الفريق',
    teamTitle: 'الأشخاص خلف أكاديمية غريس',
    team1Name: 'سارة الحسن',
    team1Role: 'المؤسِّسة والمديرة',
    team2Name: 'جيمس ويتفيلد',
    team2Role: 'رئيس قسم المناهج',
    team3Name: 'ليلى منصور',
    team3Role: 'مدرِّسة أولى',
    team4Name: 'عمر خالد',
    team4Role: 'مسؤول نجاح الطلاب',

    /* ── Services ──────────────────────────────────────── */
    servicesHeroTitle:    'برامجنا <span>التعليمية</span>',
    servicesHeroSub:      'مجموعة متكاملة من برامج تعلُّم الإنجليزية لكل هدف وكل مرحلة من مراحل الحياة.',
    servicesBreadCurrent: 'الخدمات',

    servicesLabel: 'ما نقدمه',
    servicesTitle: 'الإنجليزية لكل غرض',

    svc1Title: 'الإنجليزية التحادثية',
    svc1Body:  'تغلَّب على خوف الكلام. ابنِ طلاقة حقيقية عبر محادثات موجَّهة وتمثيل أدوار وجلسات نقاش حية.',
    svc1Tag:   'جميع المستويات',
    svc2Title: 'الإنجليزية التجارية',
    svc2Body:  'مفردات مهنية وكتابة بريد إلكتروني وتقديم عروض وتفاوض وتواصل في بيئة العمل.',
    svc2Tag:   'متوسط فما فوق',
    svc3Title: 'التحضير الأكاديمي والاختبارات',
    svc3Body:  'تحضير مكثَّف لـ IELTS وTOEFL وكامبريدج وSAT مع امتحانات محاكاة وتغذية راجعة متخصصة.',
    svc3Tag:   'IELTS / TOEFL',
    svc4Title: 'برنامج الأطفال وصغار المتعلمين',
    svc4Body:  'تعلُّم قائم على اللعب ومناسب للعمر يبني المفردات والقراءة والثقة منذ سن مبكرة.',
    svc4Tag:   'من ٥ إلى ١٥ سنة',
    svc5Title: 'الإنجليزية التقنية',
    svc5Body:  'لغة متخصصة للهندسة وتقنية المعلومات والطب والقانون — مفردات حقلية وكتابة مهنية.',
    svc5Tag:   'المهنيون',
    svc6Title: 'التدريب المؤسسي',
    svc6Body:  'برامج مؤسسية مخصصة لرفع كفاءة الفرق بالكامل بتقديم مرن من ورش عمل ميدانية إلى تدريب مباشر عبر الإنترنت.',
    svc6Tag:   'المؤسسات',

    processLabel: 'كيف يعمل ذلك',
    processTitle: 'رحلتك من التسجيل إلى الطلاقة',
    step1Title: 'تقييم التحديد',
    step1Body:  'اختبار تشخيصي سريع يضعك في المستوى الصحيح منذ اليوم الأول.',
    step2Title: 'خطة شخصية',
    step2Body:  'مستشارك المخصص يبني مساراً تعليمياً مُصمَّماً وفق أهدافك وجدولك.',
    step3Title: 'التعلُّم الحي',
    step3Body:  'احضر جلسات حية تفاعلية مع مدربين متخصصين ومتعلمين من حول العالم.',
    step4Title: 'التتبع والتقدم',
    step4Body:  'تقييمات دورية وتقارير تقدم تبقيك متحفزاً على المسار الصحيح.',

    /* ── Portfolio ─────────────────────────────────────── */
    portfolioHeroTitle:   'قصص نجاح <span>الطلاب</span>',
    portfolioHeroSub:     'نتائج حقيقية لمتعلمين حقيقيين — كل مشروع يمثل حياة تغيَّرت.',
    portfolioBreadCurrent:'أعمالنا',

    portfolioLabel: 'دراسات حالة',
    portfolioTitle: 'تعلُّم يُحقِّق نتائج',

    proj1Cat:     'تحضير IELTS',
    proj1Title:   'من Band 5 إلى Band 8 في ٦ أشهر',
    proj1Problem: 'كان الطالب يعاني في الكتابة الأكاديمية والفهم القرائي.',
    proj1Solution:'مسار IELTS مكثَّف مع ورش كتابية يومية وتدريبات قراءة موقوتة.',
    proj1Result:  'حقَّق Band 8 إجمالياً وحصل على منحة دراسية كاملة في جامعة بريطانية.',

    proj2Cat:     'الإنجليزية التجارية',
    proj2Title:   'تحوُّل في تواصل المدير التنفيذي',
    proj2Problem: 'مدير أول يفتقر إلى الثقة في العروض والتفاوضات باللغة الإنجليزية.',
    proj2Solution:'برنامج الإنجليزية التجارية المدته ١٢ أسبوعاً مع جلسات تدريب تنفيذي.',
    proj2Result:  'ترقِّى إلى مدير إقليمي ويترأس مكالمات العملاء الدوليين أسبوعياً.',

    proj3Cat:     'برنامج الأطفال',
    proj3Title:   'من الصفر إلى التحادث في سن التاسعة',
    proj3Problem: 'لم يكن للطفل أي تعرُّض للإنجليزية وعانى من قلق شديد في الكلام.',
    proj3Solution:'برنامج انغماس قائم على اللعب مع تدريب فردي أسبوعي.',
    proj3Result:  'يجري محادثات كاملة بثقة وأصبح الأول في إنجليزية المدرسة.',

    proj4Cat:     'التدريب المؤسسي',
    proj4Title:   'رفع كفاءة شركة بأكملها في الإنجليزية',
    proj4Problem: 'شركة تقنية تحتاج موظفيها للتواصل مع عملاء عالميين.',
    proj4Solution:'برنامج مؤسسي مخصص لمدة ٣ أشهر بوحدات خاصة لكل قسم.',
    proj4Result:  '٩٤٪ من الموظفين يشعرون بالثقة في الإنجليزية ورضا العملاء ارتفع ٤٠٪.',

    proj5Cat:     'الإنجليزية التحادثية',
    proj5Title:   'من خريج جامعي إلى موظف عالمي',
    proj5Problem: 'خريج ذو قواعد نحوية قوية لكنه يتجمَّد في المحادثات الحقيقية.',
    proj5Solution:'نادي تحادث انغماسي مع تحديات يومية ومساءلة بين الأقران.',
    proj5Result:  'حصل على منصب في شركة متعددة الجنسيات واجتاز مقابلة الإنجليزية من المحاولة الأولى.',

    proj6Cat:     'تحضير TOEFL',
    proj6Title:   'TOEFL 115 — القبول في أيفي ليغ',
    proj6Problem: 'كان الطالب يحتاج إلى ١١٠+ في TOEFL للقبول في برنامج دراسات عليا.',
    proj6Solution:'معسكر TOEFL المكثَّف مع ثلاثة امتحانات محاكاة كاملة ومراجعة تفصيلية.',
    proj6Result:  'حصل على ١١٥ وقُبِل في برنامجه المستهدف مع تمويل جزئي.',

    projProblem:  'التحدي:',
    projSolution: 'المقاربة:',
    projResult:   'النتيجة:',

    /* ── Contact ───────────────────────────────────────── */
    contactHeroTitle:    'تواصل <span>معنا</span>',
    contactHeroSub:      'هل أنت مستعد لبدء رحلتك في الإنجليزية؟ يسعدنا سماعك.',
    contactBreadCurrent: 'تواصل معنا',

    contactFormTitle: 'أرسل لنا رسالة',
    labelName:        'الاسم الكامل',
    labelEmail:       'البريد الإلكتروني',
    labelPhone:       'رقم الهاتف',
    labelMessage:     'رسالتك',
    placeholderName:  'اسمك الكامل',
    placeholderEmail: 'بريدك@example.com',
    placeholderPhone: '+966 5xx xxx xxxx',
    placeholderMsg:   'أخبرنا عن أهدافك وكيف يمكننا مساعدتك…',
    btnSend:          'إرسال الرسالة',
    formSuccessMsg:   'شكراً لك! سنتواصل معك خلال ٢٤ ساعة.',

    contactInfoTitle:   'معلومات التواصل',
    contactAddr:        'العنوان',
    contactAddrVal:     'الرياض، المملكة العربية السعودية',
    contactEmailLabel:  'البريد الإلكتروني',
    contactEmailVal:    'hello@graceacademy.sa',
    contactPhoneLabel:  'الهاتف',
    contactPhoneVal:    '٩٦٦ ١١ ٢٣٤ ٥٦٧٨+',
    contactHoursLabel:  'أوقات العمل',
    contactHoursVal:    'الأحد – الخميس، ٨ص – ٩م',
    mapLabel:           'خريطة الموقع قريباً',
    socialTitle:        'تابعنا',

    /* ── FAQ ───────────────────────────────────────────── */
    faqHeroTitle:   'الأسئلة <span>الشائعة</span>',
    faqHeroSub:     'كل ما تحتاج معرفته قبل أن تبدأ.',
    faqBreadCurrent:'الأسئلة الشائعة',

    faqLabel: 'الأسئلة الشائعة',
    faqTitle: 'إجابات على أسئلة شائعة',

    faq1Q: 'ما الفئات العمرية التي تدرِّسونها؟',
    faq1A: 'ندرِّس الجميع — من أطفال عمرهم ٥ سنوات إلى كبار في الستينيات. كل برنامج مصمَّم وفق أسلوب التعلم واحتياجات المفردات لكل فئة عمرية.',

    faq2Q: 'هل أحتاج إلى معرفة مسبقة بالإنجليزية للانضمام؟',
    faq2A: 'لا على الإطلاق. لدينا برامج للمبتدئين تبدأ من الصفر. اختبار التحديد عند التسجيل يضمن بدءك من المستوى المناسب تماماً.',

    faq3Q: 'هل الدروس أونلاين أم حضورية أم كلاهما؟',
    faq3A: 'نقدم جلسات حية كاملة عبر الإنترنت وفصولاً حضورية في الرياض وخيارات هجينة. أنت تختار الصيغة التي تناسب حياتك.',

    faq4Q: 'كم من الوقت حتى أرى تقدماً حقيقياً؟',
    faq4A: 'يلاحظ معظم الطلاب تحسناً ملموساً في الثقة والاستيعاب خلال ٤–٦ أسابيع من الدراسة المنتظمة. مكاسب الطلاقة الجوهرية تظهر عادةً خلال ٣–٦ أشهر.',

    faq5Q: 'ما الاختبارات التي تُحضِّرون الطلاب لها؟',
    faq5A: 'IELTS الأكاديمي والعام، وTOEFL iBT، وكامبريدج B2 وC1، وOET (الطبي)، وSAT الإنجليزية. معدل نجاح مسار التحضير لدينا ٩٢٪.',

    faq6Q: 'هل يمكن لشركتي حجز تدريب مؤسسي؟',
    faq6A: 'نعم. نقدم برامج مؤسسية مخصصة ميدانية وعبر الإنترنت للفرق من ٥ إلى أكثر من ٥٠٠. تواصل معنا للحصول على تحليل احتياجات مجاني وعرض سعر مخصص.',

    faq7Q: 'ما الحد الأقصى لحجم الفصل الدراسي؟',
    faq7A: 'الفصول الجماعية محددة بـ ٨ طلاب لضمان حصول كل متعلم على اهتمام فردي. الجلسات الفردية والمجموعات الصغيرة (٢–٣) متاحة أيضاً.',

    faq8Q: 'هل تتاح حصة تجريبية مجانية؟',
    faq8A: 'نعم! كل طالب جديد مرحَّب به لحضور حصة تجريبية مجانية واحدة قبل الالتزام. احجز حصتك من خلال صفحة التواصل.',

    /* ── Pricing ───────────────────────────────────────── */
    pricingHeroTitle:   'أسعار <span>شفافة وبسيطة</span>',
    pricingHeroSub:     'اختر الخطة التي تناسب أهدافك — قابلة للترقية أو الإلغاء في أي وقت.',
    pricingBreadCurrent:'الأسعار',

    pricingLabel: 'الخطط',
    pricingTitle: 'استثمر في رحلتك مع الإنجليزية',
    pricingNote:  'جميع الخطط تشمل تقييم التحديد مجاناً. الأسعار شهرياً.',

    plan1Name:   'المبتدئ',
    plan1Desc:   'مثالي للمبتدئين والمتعلمين غير المنتظمين الذين يريدون بناء أساس متين بوتيرتهم الخاصة.',
    plan1Price:  '٤٩',
    plan1F1:     '٤ جلسات جماعية شهرياً',
    plan1F2:     'وصول للتعلم الذاتي',
    plan1F3:     'لوحة متابعة التقدم',
    plan1F4:     'منتدى المجتمع',
    plan1F5:     'وحدات التحضير للاختبارات',
    plan1F6:     'تدريب فردي',
    plan1CTA:    'ابدأ الآن',

    plan2Badge:  'الأكثر شيوعاً',
    plan2Name:   'المحترف',
    plan2Desc:   'للمتعلمين المتحمسين الذين يريدون توجيهاً منظَّماً وتدريباً منتظماً ونتائج قابلة للقياس.',
    plan2Price:  '١٢٩',
    plan2F1:     '١٢ جلسة جماعية شهرياً',
    plan2F2:     'وصول للتعلم الذاتي',
    plan2F3:     'لوحة متابعة التقدم',
    plan2F4:     'منتدى المجتمع',
    plan2F5:     'وحدات التحضير للاختبارات',
    plan2F6:     'جلستان فرديتان شهرياً',
    plan2CTA:    'ابدأ التجربة المجانية',

    plan3Name:   'النخبة',
    plan3Desc:   'أقصى كثافة للمهنيين والمرشحين للاختبارات أو لمن يريد أسرع تقدم ممكن.',
    plan3Price:  '٢٤٩',
    plan3F1:     'جلسات جماعية غير محدودة',
    plan3F2:     'وصول للتعلم الذاتي',
    plan3F3:     'لوحة متابعة التقدم',
    plan3F4:     'دعم مجتمع ذو أولوية',
    plan3F5:     'مجموعة التحضير الكاملة للاختبارات',
    plan3F6:     '٨ جلسات فردية شهرياً',
    plan3CTA:    'اختر النخبة',

    /* ── Blog ──────────────────────────────────────────── */
    blogHeroTitle:   'مدونة <span>أكاديمية غريس</span>',
    blogHeroSub:     'نصائح واستراتيجيات وقصص من عالم تعلُّم اللغة الإنجليزية.',
    blogBreadCurrent:'المدونة',

    blogLabel: 'آخر المقالات',
    blogTitle: 'تعلَّم أبعد من الفصل الدراسي',

    blog1Cat:     'نصائح التعلم',
    blog1Date:    'أبريل ٢٠٢٥',
    blog1Title:   '١٠ عادات للمتحدثين المتقنين للإنجليزية',
    blog1Excerpt: 'الطلاقة ليست وجهة — إنها ممارسة يومية. اكتشف العادات العشر المشتركة بين أكثر طلابنا نجاحاً.',

    blog2Cat:     'التحضير للاختبارات',
    blog2Date:    'مارس ٢٠٢٥',
    blog2Title:   'مهمة الكتابة الثانية في IELTS: الدليل الكامل 2025',
    blog2Excerpt: 'كل ما تحتاج معرفته عن بناء مقالة أكاديمية تستحق Band 9 من المقدمة إلى الخاتمة.',

    blog3Cat:     'قصة نجاح',
    blog3Date:    'مارس ٢٠٢٥',
    blog3Title:   'كيف انتقلت ليلى من B1 إلى C2 في أقل من عام',
    blog3Excerpt: 'مقابلة صريحة مع إحدى طالباتنا المتميزات عن تحولات التفكير التي أحدثت الفارق.',

    blog4Cat:     'النطق',
    blog4Date:    'فبراير ٢٠٢٥',
    blog4Title:   'لماذا لهجتك ميزة وليست عائقاً',
    blog4Excerpt: 'نطق شبيه بالناطق الأصلي نادراً ما يكون ضرورياً للتواصل العالمي. إليك ما يهم حقاً وكيف تطوِّره.',

    blog5Cat:     'المفردات',
    blog5Date:    'فبراير ٢٠٢٥',
    blog5Title:   'الـ٥٠٠ كلمة التي تغطي ٩٠٪ من الإنجليزية اليومية',
    blog5Excerpt: 'بناء مفردات عالية التردد هو أسرع طريق للطلاقة الوظيفية. نستعرض الأبحاث.',

    blog6Cat:     'الأطفال والآباء',
    blog6Date:    'يناير ٢٠٢٥',
    blog6Title:   'كيف تبني بيئة منزلية غنية بالإنجليزية',
    blog6Excerpt: 'الآباء هم أقوى المعلمين. أفكار عملية لنسج الإنجليزية بشكل طبيعي في الحياة اليومية لأسرتك.',

    readMore: 'اقرأ المزيد',
  }
};

/* ── State ────────────────────────────────────────────────────── */
let currentLang  = localStorage.getItem('ga-lang')  || 'en';
let currentTheme = localStorage.getItem('ga-theme') || 'dark';

/* ── Theme ────────────────────────────────────────────────────── */
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ga-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  btn.innerHTML = theme === 'dark' ? sunIcon() : moonIcon();
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function sunIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

function moonIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
}

/* ── Translations ─────────────────────────────────────────────── */
function applyTranslations(lang) {
  currentLang = lang;
  const t = translations[lang];
  const isAr = lang === 'ar';

  document.documentElement.lang = lang;
  document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = isAr ? 'EN' : 'عربي';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  /* Placeholders */
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });

  /* Font family swap */
  document.documentElement.style.setProperty(
    '--font-active', isAr ? 'var(--font-ar)' : 'var(--font-en)'
  );

  localStorage.setItem('ga-lang', lang);
}

function toggleLanguage() {
  applyTranslations(currentLang === 'en' ? 'ar' : 'en');
}

/* ── Scroll Effects ───────────────────────────────────────────── */
let ticking = false;
const navbar = document.getElementById('navbar');

function onScroll() {
  if (ticking) return;
  requestAnimationFrame(() => {
    const y = window.scrollY;

    /* Navbar */
    if (navbar) navbar.classList.toggle('scrolled', y > 60);

    /* Progress bar */
    const bar = document.getElementById('scrollProgress');
    if (bar) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
    }

    ticking = false;
  });
  ticking = true;
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ── Active Nav Link ──────────────────────────────────────────── */
function setActiveNavLink() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === currentFile);
  });
}

/* ── Mobile Menu ──────────────────────────────────────────────── */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('navMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.classList.toggle('open', open);
  });

  menu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Scroll Reveal ────────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal], .stat-card, .mv-card, .why-card, .team-card, .service-card, .project-card, .blog-card, .pricing-card, .faq-item, .process-step');
  if (!els.length) return;

  /* Stagger grids */
  const grids = [
    '.stats-grid',
    '.why-grid',
    '.team-grid',
    '.services-grid',
    '.portfolio-grid',
    '.blog-grid',
    '.pricing-grid',
    '.process-steps',
    '.mv-grid',
  ];
  grids.forEach(sel => {
    document.querySelectorAll(`${sel} > *`).forEach((child, i) => {
      child.style.transitionDelay = `${i * 70}ms`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => observer.observe(el));
}

/* ── Animated Counters ────────────────────────────────────────── */
function animateCount(el) {
  const target = +el.getAttribute('data-count');
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

/* ── FAQ Accordion ────────────────────────────────────────────── */
function initFaq() {
  document.querySelectorAll('.faq-item__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ── Contact Form ─────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.opacity = '.5';
    form.style.pointerEvents = 'none';
    setTimeout(() => {
      form.reset();
      form.style.opacity = '1';
      form.style.pointerEvents = '';
      if (successMsg) successMsg.classList.add('visible');
    }, 800);
  });
}

/* ── Init ─────────────────────────────────────────────────────── */
function init() {
  /* Restore theme before paint to avoid flash */
  applyTheme(currentTheme);

  /* Restore language */
  applyTranslations(currentLang);

  setActiveNavLink();
  initMobileMenu();
  initReveal();
  initCounters();
  initFaq();
  initContactForm();

  /* Theme toggle */
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* Lang toggle */
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);

  /* Initial scroll state */
  onScroll();
}

document.addEventListener('DOMContentLoaded', init);
