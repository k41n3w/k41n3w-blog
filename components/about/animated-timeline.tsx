"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface TimelineItem {
  year: string
  title: string
  company: string
  description: string
}

interface AnimatedTimelineProps {
  items: TimelineItem[]
}

export default function AnimatedTimeline({ items }: AnimatedTimelineProps) {
  return (
    <>
      {/* Timeline para desktop - alternando lados */}
      <div className="hidden md:block">
        <div className="relative max-w-6xl mx-auto">
          {/* Linha vertical centralizada */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-red-500"
            style={{ transform: "translateX(-50%)" }}
          ></div>

          <div className="space-y-16">
            {items.map((item, index) => (
              <TimelineItemDesktop key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Timeline para mobile - todos os itens à direita */}
      <div className="md:hidden">
        <div className="relative">
          {/* Linha vertical à esquerda */}
          <div
            className="absolute left-5 top-0 bottom-0 w-[2px] bg-red-500"
            style={{ transform: "translateX(-50%)" }}
          ></div>

          <div className="space-y-8">
            {items.map((item, index) => (
              <TimelineItemMobile key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function TimelineItemDesktop({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const variants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  }

  return (
    <div ref={ref} className="flex items-center">
      {/* Conteúdo à esquerda para índices pares */}
      <div className="w-1/2 pr-12 text-right">
        {index % 2 === 0 && (
          <motion.div variants={variants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <div className="flex items-center justify-end text-gray-400 mb-2">
              <span className="mr-2">{item.company}</span>
              <span className="text-red-500">{item.year}</span>
            </div>
            <p className="text-gray-300">{item.description}</p>
          </motion.div>
        )}
      </div>

      {/* Círculo centralizado */}
      <div className="relative flex-shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-5 h-5 bg-black border-2 border-red-500 rounded-full z-10 relative"
        />
      </div>

      {/* Conteúdo à direita para índices ímpares */}
      <div className="w-1/2 pl-12">
        {index % 2 === 1 && (
          <motion.div variants={variants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <div className="flex items-center text-gray-400 mb-2">
              <span className="mr-2">{item.company}</span>
              <span className="text-red-500">{item.year}</span>
            </div>
            <p className="text-gray-300">{item.description}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TimelineItemMobile({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const variants = {
    hidden: {
      opacity: 0,
      x: -20,
      y: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.1 * index,
      },
    },
  }

  return (
    <div ref={ref} className="flex items-start">
      {/* Círculo na linha */}
      <div className="relative mr-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.3, delay: 0.05 * index }}
          className="w-5 h-5 bg-black border-2 border-red-500 rounded-full z-10 relative"
          style={{ left: "5px" }}
        />
      </div>

      {/* Conteúdo */}
      <motion.div variants={variants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="flex-1">
        <h3 className="text-xl font-bold text-white">{item.title}</h3>
        <div className="flex items-center text-gray-400 mb-2">
          <span className="mr-2">{item.company}</span>
          <span className="text-red-500">{item.year}</span>
        </div>
        <p className="text-gray-300">{item.description}</p>
      </motion.div>
    </div>
  )
}
