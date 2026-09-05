"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id)

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`categoria-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id.replace("categoria-", ""))
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [categories])

  function scrollTo(id: string) {
    const el = document.getElementById(`categoria-${id}`)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: y, behavior: "smooth" })
      setActiveId(id)
    }
  }

  return (
    <nav
      className="sticky top-0 z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:px-0"
      aria-label="Categorias do cardápio"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => scrollTo(category.id)}
          aria-current={activeId === category.id ? "true" : undefined}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeId === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          {category.name}
        </button>
      ))}
    </nav>
  )
}
