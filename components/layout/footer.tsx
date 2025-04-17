import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">k41n3w</h3>
            <p className="text-gray-400">A tech blog for Ruby on Rails developers and enthusiasts.</p>
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
              <li>
                <Link href="/contact" className="hover:text-red-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">Get the latest posts delivered to your inbox.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                disabled
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-red-500 border-0 opacity-70"
              />
              <TooltipProvider>
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-red-600 hover:bg-red-700 rounded-l-none opacity-70 cursor-not-allowed"
                      disabled
                    >
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
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {currentYear} k41n3w. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
