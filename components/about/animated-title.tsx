"use client"

import { motion } from "framer-motion"

interface AnimatedTitleProps {
  title: string
}

export default function AnimatedTitle({ title }: AnimatedTitleProps) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="text-4xl font-bold text-red-500 mb-8 text-center"
    >
      {title}
    </motion.h1>
  )
}
