import Link from "next/link"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Github, Linkedin, Facebook, Instagram, FileText } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Medium",
      icon: <FileText className="h-5 w-5" />,
      url: "https://medium.com/@caio_ramos",
      color: "hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://www.linkedin.com/in/k41n3w/",
      color: "hover:text-blue-400",
    },
    {
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      url: "https://github.com/k41n3w/",
      color: "hover:text-purple-400",
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      url: "https://www.instagram.com/k41n3w/",
      color: "hover:text-pink-500",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: "https://www.facebook.com/kaaineo/",
      color: "hover:text-blue-500",
    },
  ]

  return (
    <footer className="py-8 bg-zinc-950 border-t border-zinc-800 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 box-border text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold text-white mb-1">k41n3w</h3>
            <span className="block h-0.5 w-8 bg-red-600 mb-3" />
            <p className="text-zinc-500">Engenharia de software com propósito. Rails, IA e decisões que escalam.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold text-white mb-1">Links</h3>
            <span className="block h-0.5 w-8 bg-red-600 mb-3" />
            <ul className="space-y-2 text-zinc-500">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:text-white transition-colors">
                  Archive
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col items-center">
          <p className="text-zinc-500 text-sm mb-4">Você me encontra em:</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-zinc-500 transition-all duration-200 transform hover:scale-105 ${social.color}`}
                aria-label={social.name}
              >
                <TooltipProvider>
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <div className="bg-zinc-900 border border-zinc-800 p-3 hover:border-zinc-600 transition-colors">{social.icon}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.name}</p>
                    </TooltipContent>
                  </TooltipRoot>
                </TooltipProvider>
              </a>
            ))}
          </div>
          <p className="text-zinc-600 text-sm">&copy; {currentYear} k41n3w. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
