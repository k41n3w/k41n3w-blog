"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/footer"
import AnimatedTimeline from "@/components/about/animated-timeline"
import AnimatedProfile from "@/components/about/animated-profile"
import AnimatedTitle from "@/components/about/animated-title"

export default function AboutPage() {
  const experiences = [
    {
      year: "2022 • Present",
      title: "Tech Lead",
      company: "Smart Fit",
      description: "Leading development teams and architecting scalable solutions.",
    },
    {
      year: "2021 • 2020",
      title: "Senior Developer",
      company: "Caiena",
      description: "Developed and maintained critical micro services applications using Ruby on Rails.",
    },
    {
      year: "2020 • 2021",
      title: "Full Stack Developer",
      company: "Portal Solar",
      description: "Built innovative web applications and native apps.",
    },
    {
      year: "2017 • 2020",
      title: "Full Stack Developer",
      company: "Ateliê de Software",
      description: "Began studying Ruby, Ruby on Rails, Docker, Agile practices, AWS, and related technologies.",
    },
    {
      year: "2016 • 2020",
      title: "Full Stack Developer",
      company: "Outcenter",
      description: "Began my journey developing PHP, Angular and IONIC pages and apps",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para a Home
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <AnimatedTitle title="About Me" />

        <AnimatedProfile
          skills={[
            "Ruby",
            "Ruby on Rails",
            "JavaScript",
            "React",
            "PostgreSQL",
            "AWS",
            "Docker",
            "Team Leadership",
            "Agile Methodologies",
            "System Architecture",
          ]}
        />

        {/* Additional Section - Timeline */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-red-500 mb-8 text-center">Professional Journey</h2>

          <AnimatedTimeline items={experiences} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
