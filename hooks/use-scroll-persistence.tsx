"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function useScrollPersistence() {
    const pathname = usePathname()
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const savedScrollPosition = localStorage.getItem(`scroll-${pathname}`)
        if (savedScrollPosition) {
            const scrollY = Number.parseInt(savedScrollPosition, 10)
            setTimeout(() => {
                window.scrollTo(0, scrollY)
            }, 100)
        }
        const handleScroll = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                localStorage.setItem(`scroll-${pathname}`, window.scrollY.toString())
            }, 150)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [pathname])
    const clearScrollPosition = () => {
        localStorage.removeItem(`scroll-${pathname}`)
    }
    const clearAllScrollPositions = () => {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
            if (key.startsWith("scroll-")) {
                localStorage.removeItem(key)
            }
        })
    }

    return {
        clearScrollPosition,
        clearAllScrollPositions,
    }
}
