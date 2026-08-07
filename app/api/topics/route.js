import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent, writeContent } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  if (!user) return null
  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !ADMIN_ONLY_PERMS.includes(p))
  const isAssessor = permissions.includes('access_assessor_portal') && !hasAdminAccess
  return { ...user, permissions, hasAdminAccess, isAssessor }
}

const SEED = [
  { nameEn: 'Travel & Adventure',              nameAr: 'السفر والمغامرة' },
  { nameEn: 'Food & Cuisine',                  nameAr: 'الطعام والمطبخ' },
  { nameEn: 'Music & Arts',                    nameAr: 'الموسيقى والفنون' },
  { nameEn: 'Sports & Fitness',                nameAr: 'الرياضة واللياقة' },
  { nameEn: 'Technology & Innovation',         nameAr: 'التكنولوجيا والابتكار' },
  { nameEn: 'Science & Discovery',             nameAr: 'العلوم والاكتشافات' },
  { nameEn: 'History & Culture',               nameAr: 'التاريخ والثقافة' },
  { nameEn: 'Movies & TV Shows',               nameAr: 'الأفلام والمسلسلات' },
  { nameEn: 'Books & Literature',              nameAr: 'الكتب والأدب' },
  { nameEn: 'Business & Entrepreneurship',     nameAr: 'الأعمال وريادة الأعمال' },
  { nameEn: 'Current Events & News',           nameAr: 'الأخبار والأحداث الراهنة' },
  { nameEn: 'Health & Wellness',               nameAr: 'الصحة والعافية' },
  { nameEn: 'Education & Learning',            nameAr: 'التعليم والتعلم' },
  { nameEn: 'Environment & Climate',           nameAr: 'البيئة والمناخ' },
  { nameEn: 'Fashion & Style',                 nameAr: 'الموضة والأناقة' },
  { nameEn: 'Gaming & Video Games',            nameAr: 'الألعاب الإلكترونية' },
  { nameEn: 'Philosophy & Ethics',             nameAr: 'الفلسفة والأخلاق' },
  { nameEn: 'Psychology & Human Behavior',     nameAr: 'علم النفس والسلوك البشري' },
  { nameEn: 'Politics & Government',           nameAr: 'السياسة والحكومة' },
  { nameEn: 'Economics & Finance',             nameAr: 'الاقتصاد والمال' },
  { nameEn: 'Social Media & Internet',         nameAr: 'وسائل التواصل الاجتماعي والإنترنت' },
  { nameEn: 'Family & Relationships',          nameAr: 'الأسرة والعلاقات' },
  { nameEn: 'Career & Work Life',              nameAr: 'المهنة وبيئة العمل' },
  { nameEn: 'Hobbies & Leisure',               nameAr: 'الهوايات وأوقات الفراغ' },
  { nameEn: 'Animals & Pets',                  nameAr: 'الحيوانات والحيوانات الأليفة' },
  { nameEn: 'Space & Astronomy',               nameAr: 'الفضاء وعلم الفلك' },
  { nameEn: 'Photography & Visual Arts',       nameAr: 'التصوير والفنون البصرية' },
  { nameEn: 'Comedy & Humor',                  nameAr: 'الكوميديا والفكاهة' },
  { nameEn: 'Language & Linguistics',          nameAr: 'اللغة وعلم اللغويات' },
  { nameEn: 'Architecture & Design',           nameAr: 'العمارة والتصميم' },
  { nameEn: 'Cooking & Recipes',               nameAr: 'الطبخ والوصفات' },
  { nameEn: 'DIY & Crafts',                    nameAr: 'الأعمال اليدوية والحرف' },
  { nameEn: 'Mental Health & Mindfulness',     nameAr: 'الصحة النفسية والوعي الذاتي' },
  { nameEn: 'Volunteering & Social Impact',    nameAr: 'التطوع والأثر الاجتماعي' },
  { nameEn: 'Parenting & Childcare',           nameAr: 'التربية ورعاية الأطفال' },
  { nameEn: 'Investing & Personal Finance',    nameAr: 'الاستثمار والتمويل الشخصي' },
  { nameEn: 'Startups & Innovation',           nameAr: 'الشركات الناشئة والابتكار' },
  { nameEn: 'Leadership & Management',         nameAr: 'القيادة والإدارة' },
  { nameEn: 'Fitness & Nutrition',             nameAr: 'اللياقة والتغذية' },
  { nameEn: 'Meditation & Spirituality',       nameAr: 'التأمل والروحانيات' },
  { nameEn: 'Theater & Performing Arts',       nameAr: 'المسرح والفنون الأدائية' },
  { nameEn: 'Dance & Movement',                nameAr: 'الرقص والحركة' },
  { nameEn: 'Writing & Storytelling',          nameAr: 'الكتابة وفن القصص' },
  { nameEn: 'Podcasts & Audio Media',          nameAr: 'البودكاست والإعلام الصوتي' },
  { nameEn: 'Artificial Intelligence',         nameAr: 'الذكاء الاصطناعي' },
  { nameEn: 'Cybersecurity & Privacy',         nameAr: 'الأمن الإلكتروني والخصوصية' },
  { nameEn: 'Law & Justice',                   nameAr: 'القانون والعدالة' },
  { nameEn: 'Medicine & Healthcare',           nameAr: 'الطب والرعاية الصحية' },
  { nameEn: 'Engineering & Technology',        nameAr: 'الهندسة والتكنولوجيا' },
  { nameEn: 'Marketing & Advertising',         nameAr: 'التسويق والإعلان' },
  { nameEn: 'Cultural Differences & Diversity',nameAr: 'الاختلافات الثقافية والتنوع' },
  { nameEn: 'Languages & Multilingualism',     nameAr: 'اللغات والتعددية اللغوية' },
  { nameEn: 'TV Documentaries',                nameAr: 'الأفلام الوثائقية' },
  { nameEn: 'Music Production',                nameAr: 'إنتاج الموسيقى' },
  { nameEn: 'Climate Change Solutions',        nameAr: 'حلول تغير المناخ' },
  { nameEn: 'Public Speaking & Presentations', nameAr: 'الخطابة العامة والعروض التقديمية' },
  { nameEn: 'Negotiation & Conflict Resolution',nameAr: 'التفاوض وحل النزاعات' },
  { nameEn: 'Creativity & Innovation',         nameAr: 'الإبداع والابتكار' },
  { nameEn: 'Debate & Argumentation',          nameAr: 'الجدال والحجج' },
  { nameEn: 'Archaeology & Ancient History',   nameAr: 'الآثار والتاريخ القديم' },
  { nameEn: 'Mythology & Folklore',            nameAr: 'الأساطير والتراث الشعبي' },
  { nameEn: 'Urban Planning & Cities',         nameAr: 'التخطيط الحضري والمدن' },
  { nameEn: 'Agriculture & Sustainability',    nameAr: 'الزراعة والاستدامة' },
  { nameEn: 'Ocean & Marine Life',             nameAr: 'المحيطات والحياة البحرية' },
  { nameEn: 'Renewable Energy',                nameAr: 'الطاقة المتجددة' },
  { nameEn: 'Transportation & Mobility',       nameAr: 'النقل والتنقل' },
  { nameEn: 'Robotics & Automation',           nameAr: 'الروبوتات والأتمتة' },
  { nameEn: 'Blockchain & Cryptocurrency',     nameAr: 'البلوك تشين والعملات الرقمية' },
  { nameEn: 'Virtual Reality & Metaverse',     nameAr: 'الواقع الافتراضي والميتافيرس' },
  { nameEn: 'Human Rights & Activism',         nameAr: 'حقوق الإنسان والنشاط الحقوقي' },
  { nameEn: 'Gender & Identity',               nameAr: 'النوع الاجتماعي والهوية' },
  { nameEn: 'Immigration & Integration',       nameAr: 'الهجرة والاندماج' },
  { nameEn: 'War & Peace',                     nameAr: 'الحرب والسلام' },
  { nameEn: 'Diplomacy & International Relations', nameAr: 'الدبلوماسية والعلاقات الدولية' },
  { nameEn: 'Extreme Sports & Adventure',      nameAr: 'الرياضات المتطرفة والمغامرة' },
  { nameEn: 'Board Games & Puzzles',           nameAr: 'الألعاب اللوحية والألغاز' },
  { nameEn: 'Hiking & Outdoor Activities',     nameAr: 'المشي في الطبيعة والأنشطة الخارجية' },
  { nameEn: 'National Parks & Wildlife',       nameAr: 'الحدائق الوطنية والحياة البرية' },
  { nameEn: 'Graphic Design & Illustration',   nameAr: 'التصميم الجرافيكي والرسوم التوضيحية' },
  { nameEn: 'Animation & Manga',               nameAr: 'الرسوم المتحركة والمانغا' },
  { nameEn: 'Fashion History',                 nameAr: 'تاريخ الموضة' },
  { nameEn: 'Celebrity & Pop Culture',         nameAr: 'ثقافة المشاهير والثقافة الشعبية' },
  { nameEn: 'Reality TV & Entertainment',      nameAr: 'برامج الواقع والترفيه' },
  { nameEn: 'True Crime & Mystery',            nameAr: 'الجرائم الحقيقية والغموض' },
  { nameEn: 'Science Fiction & Fantasy',       nameAr: 'الخيال العلمي والفانتازيا' },
  { nameEn: 'Personal Development',            nameAr: 'التطوير الشخصي' },
  { nameEn: 'Sleep & Recovery',                nameAr: 'النوم والتعافي' },
  { nameEn: 'Journaling & Self-Reflection',    nameAr: 'كتابة اليوميات والتأمل الذاتي' },
  { nameEn: 'Empathy & Emotional Intelligence',nameAr: 'التعاطف والذكاء العاطفي' },
  { nameEn: 'Memory & Learning Techniques',    nameAr: 'الذاكرة وتقنيات التعلم' },
  { nameEn: 'Astrology & Horoscopes',          nameAr: 'علم التنجيم والأبراج' },
  { nameEn: 'Maps & Geography',                nameAr: 'الخرائط والجغرافيا' },
  { nameEn: 'Future of Work',                  nameAr: 'مستقبل العمل' },
  { nameEn: 'Art Collecting & Galleries',      nameAr: 'جمع الفنون والمعارض' },
  { nameEn: 'Volunteering Abroad',             nameAr: 'التطوع في الخارج' },
  { nameEn: 'Stand-Up Comedy & Satire',        nameAr: 'الكوميديا المسرحية والسخرية' },
  { nameEn: 'Streaming & Digital Content',     nameAr: 'البث الرقمي والمحتوى الرقمي' },
  { nameEn: 'Global Cuisines',                 nameAr: 'المأكولات العالمية' },
  { nameEn: 'Minimalism & Simple Living',      nameAr: 'الحياة البسيطة والبساطة' },
  { nameEn: 'Artificial Languages (Conlangs)', nameAr: 'اللغات الاصطناعية' },
]

function buildSeeds() {
  const now = new Date().toISOString()
  return SEED.map((t, i) => ({
    id: `topic_${String(i + 1).padStart(3, '0')}`,
    nameEn: t.nameEn,
    nameAr: t.nameAr,
    active: true,
    createdAt: now,
    createdBy: 'system',
  }))
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let topics = await readContent('topics')
  if (!Array.isArray(topics)) {
    topics = buildSeeds()
    await writeContent('topics', topics)
  }

  const result = user.hasAdminAccess ? topics : topics.filter(t => t.active !== false)
  return NextResponse.json({ topics: result })
}

export async function POST(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { nameEn, nameAr } = await req.json()
  if (!nameEn?.trim()) return NextResponse.json({ error: 'Topic name in English is required' }, { status: 400 })

  let topics = await readContent('topics')
  if (!Array.isArray(topics)) topics = buildSeeds()

  const duplicate = topics.find(t => t.nameEn.toLowerCase() === nameEn.trim().toLowerCase())
  if (duplicate) return NextResponse.json({ error: 'A topic with this name already exists', existing: duplicate }, { status: 409 })

  const newTopic = {
    id: `topic_${Date.now()}`,
    nameEn: nameEn.trim(),
    nameAr: nameAr?.trim() || nameEn.trim(),
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  }
  topics.push(newTopic)
  await writeContent('topics', topics)

  return NextResponse.json({ topic: newTopic })
}

export async function PUT(req) {
  const user = await getAuthUser()
  if (!user?.hasAdminAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, nameEn, nameAr, active } = await req.json()
  if (!id) return NextResponse.json({ error: 'Topic ID required' }, { status: 400 })

  let topics = await readContent('topics')
  if (!Array.isArray(topics)) return NextResponse.json({ error: 'No topics found' }, { status: 404 })

  const idx = topics.findIndex(t => t.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  topics[idx] = {
    ...topics[idx],
    nameEn: nameEn?.trim() || topics[idx].nameEn,
    nameAr: nameAr?.trim() || topics[idx].nameAr,
    active: active !== undefined ? Boolean(active) : topics[idx].active,
    updatedAt: new Date().toISOString(),
  }
  await writeContent('topics', topics)

  return NextResponse.json({ topic: topics[idx] })
}

export async function DELETE(req) {
  const user = await getAuthUser()
  if (!user?.hasAdminAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Topic ID required' }, { status: 400 })

  let topics = await readContent('topics')
  if (!Array.isArray(topics)) return NextResponse.json({ error: 'No topics found' }, { status: 404 })

  const before = topics.length
  topics = topics.filter(t => t.id !== id)
  if (topics.length === before) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  await writeContent('topics', topics)
  return NextResponse.json({ success: true })
}
