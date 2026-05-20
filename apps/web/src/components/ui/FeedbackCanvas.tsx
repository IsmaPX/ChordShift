import { useEffect, useRef, useState } from 'react'
import type { FeedbackConcept, FeedbackRing } from '@/audio/types'

interface FeedbackCanvasProps {
  concept: FeedbackConcept
  isCorrect: boolean | null
  onAnimationComplete?: () => void
}

export function FeedbackCanvas({
  concept,
  isCorrect,
  onAnimationComplete,
}: FeedbackCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const ringsRef = useRef<FeedbackRing[]>([])
  const [dimensions] = useState({ width: 200, height: 200 })

  const pulseColor = isCorrect ? '#22c55e' : '#ef4444'
  const successColor = '#22c55e'
  const errorColor = '#ef4444'

  useEffect(() => {
    if (isCorrect === null) return

    if (concept === 'pulse') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let scale = 1
      let alpha = 1

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = 40 * scale

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fillStyle = `${pulseColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        scale += 0.02
        alpha *= 0.96

        if (alpha > 0.01) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          onAnimationComplete?.()
        }
      }

      animate()
    }

    if (concept === 'bar') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let width = 0
      const maxWidth = canvas.width * 0.8
      const targetWidth = isCorrect ? maxWidth : 0

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barHeight = 8
        const centerY = canvas.height / 2
        const x = (canvas.width - width) / 2

        ctx.fillStyle = pulseColor
        ctx.fillRect(x, centerY - barHeight / 2, width, barHeight)

        const diff = targetWidth - width
        width += diff * 0.1

        if (Math.abs(diff) > 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          onAnimationComplete?.()
        }
      }

      animate()
    }

    if (concept === 'rings') {
      const color = isCorrect ? successColor : errorColor
      ringsRef.current = [{ radius: 20, alpha: 1, color }]

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        ringsRef.current = ringsRef.current.filter((ring) => {
          ring.radius += 1.8
          ring.alpha *= 0.93

          if (ring.alpha < 0.01) return false

          ctx.beginPath()
          ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `${ring.color}${Math.round(ring.alpha * 255).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 3
          ctx.stroke()

          return true
        })

        if (ringsRef.current.length > 0) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          onAnimationComplete?.()
        }
      }

      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isCorrect, concept, onAnimationComplete])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-[200px] h-[200px]"
    />
  )
}