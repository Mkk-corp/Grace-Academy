'use client'
import { useState } from 'react'
import CourseDetailView from '@/components/shared/CourseDetailView'
import CoursePageShell from '@/components/shared/CoursePageShell'

export default function Page() {
  const [course, setCourse] = useState(null)
  return (
    <CoursePageShell portalType="student" backHref="/portal" courseName={course?.nameEn} courseNameAr={course?.nameAr}>
      <CourseDetailView noNav stickyTop={100} onLoad={setCourse} />
    </CoursePageShell>
  )
}
