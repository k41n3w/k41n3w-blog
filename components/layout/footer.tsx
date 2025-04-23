import Link from "next/link"
import { Button } from "@/components/ui/button"
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
    <footer className="py-8 bg-gray-900 border-t border-gray-800 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 box-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">k41n3w</h3>
            <p className="text-gray-400">Entre códigos, dados e ideias: Rails, IA e inovação.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-red-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:text-red-400">
                  Archive
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">Em breve teremos uma news letter!</p>
            <div className="flex flex-wrap">
              <input
                type="email"
                placeholder="Your email"
                disabled
                className="bg-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 border-0 opacity-70 flex-grow min-w-0"
              />
              <TooltipProvider>
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 opacity-70 cursor-not-allowed" disabled>
                      Subscribe
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </TooltipRoot>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-red-500 mb-4">Você me encontra em:</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-400 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                aria-label={social.name}
              >
                <TooltipProvider>
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <div className="bg-gray-800 p-3 hover:bg-gray-700 transition-colors">{social.icon}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.name}</p>
                    </TooltipContent>
                  </TooltipRoot>
                </TooltipProvider>
              </a>
            ))}
          </div>
          <p className="text-gray-500">&copy; {currentYear} k41n3w. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
