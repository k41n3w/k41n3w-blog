import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/footer"

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
        <h1 className="text-4xl font-bold text-red-500 mb-8 text-center">About Me</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Profile Image with Animation */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="/images/profile.jpg"
                alt="Profile"
                width={500}
                height={500}
                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Bio Text */}
          <div className="space-y-6 text-lg">
            <p>
              I am a Tech Lead with extensive experience in software development, specializing in Ruby and Ruby on
              Rails. I lead teams and projects focused on delivering scalable, high-performance applications with strong
              technical quality.
            </p>

            <p>
              My passion for technology started early, and throughout my career, I have built a solid foundation not
              only in developing robust systems but also in building and mentoring high-performance teams. I believe
              that the role of a technical leader goes far beyond writing code — it's about inspiring, teaching, and
              creating an environment where people can grow continuously.
            </p>

            <p>
              I take pride in staying close to technological trends, such as Artificial Intelligence, always seeking to
              apply best practices and bring innovation to the projects I'm involved in.
            </p>

            <p>
              I am driven by challenges, continuous learning, and the pursuit of building solutions that truly make a
              difference for people and for businesses.
            </p>

            <div className="pt-4">
              <h3 className="text-xl font-bold text-red-500 mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {[
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
                ].map((skill) => (
                  <span key={skill} className="bg-gray-800 text-red-400 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Section - Timeline */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-red-500 mb-8 text-center">Professional Journey</h2>

          {/* Timeline para desktop - alternando lados */}
          <div className="hidden md:block relative">
            {/* Linha vertical centralizada */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-red-500"></div>

            <div className="space-y-16">
              {experiences.map((item, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Círculo centralizado na linha */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border-2 border-red-500 bg-black"></div>

                  {/* Conteúdo à esquerda para índices pares */}
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 left-1/2"}`}>
                    {index % 2 === 0 && (
                      <>
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        <div className="flex items-center justify-end text-gray-400 mb-2">
                          <span className="mr-2">{item.company}</span>
                          <span className="text-red-500">{item.year}</span>
                        </div>
                        <p className="text-gray-300">{item.description}</p>
                      </>
                    )}
                  </div>

                  {/* Conteúdo à direita para índices ímpares */}
                  <div className={`w-1/2 ${index % 2 === 1 ? "pl-8" : "pr-8 text-right"}`}>
                    {index % 2 === 1 && (
                      <>
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        <div className="flex items-center text-gray-400 mb-2">
                          <span className="mr-2">{item.company}</span>
                          <span className="text-red-500">{item.year}</span>
                        </div>
                        <p className="text-gray-300">{item.description}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline para mobile - todos os itens à direita */}
          <div className="md:hidden relative">
            {/* Linha vertical à esquerda */}
            <div className="absolute left-2.5 top-0 h-full w-0.5 bg-red-500"></div>

            <div className="space-y-8">
              {experiences.map((item, index) => (
                <div key={index} className="relative pl-10">
                  {/* Círculo na linha */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-red-500 bg-black"></div>

                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <div className="flex items-center text-gray-400 mb-2">
                    <span className="mr-2">{item.company}</span>
                    <span className="text-red-500">{item.year}</span>
                  </div>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
