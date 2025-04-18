"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"

interface AnimatedProfileProps {
  skills: string[]
}

export default function AnimatedProfile({ skills }: AnimatedProfileProps) {
  const profileRef = useRef(null)
  const bioRef = useRef(null)
  const isProfileInView = useInView(profileRef, { once: true, amount: 0.3 })
  const isBioInView = useInView(bioRef, { once: true, amount: 0.3 })

  const profileVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const bioVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.3 + i * 0.1,
      },
    }),
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Profile Image with Animation */}
      <motion.div
        ref={profileRef}
        variants={profileVariants}
        initial="hidden"
        animate={isProfileInView ? "visible" : "hidden"}
        className="relative group"
      >
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
      </motion.div>

      {/* Bio Text */}
      <div ref={bioRef} className="space-y-6 text-lg">
        <motion.div variants={bioVariants} initial="hidden" animate={isBioInView ? "visible" : "hidden"}>
          <p>
            I am a Tech Lead with extensive experience in software development, specializing in Ruby and Ruby on Rails.
            I lead teams and projects focused on delivering scalable, high-performance applications with strong
            technical quality.
          </p>

          <p>
            My passion for technology started early, and throughout my career, I have built a solid foundation not only
            in developing robust systems but also in building and mentoring high-performance teams. I believe that the
            role of a technical leader goes far beyond writing code — it's about inspiring, teaching, and creating an
            environment where people can grow continuously.
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
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  custom={index}
                  variants={skillVariants}
                  initial="hidden"
                  animate={isBioInView ? "visible" : "hidden"}
                  className="bg-gray-800 text-red-400 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
