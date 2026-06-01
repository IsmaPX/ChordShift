import { MusicalParticles } from '@/components/effects/MusicalParticles'
import { GlowTrail } from '@/components/effects/GlowTrail'
import { SparkleEffect } from '@/components/effects/SparkleEffect'
import { BackgroundMotion } from '@/components/effects/BackgroundMotion'
import { ParallaxContainer } from '@/components/animations/ParallaxContainer'
import { AnimeSceneTransition } from '@/components/transitions/AnimeSceneTransition'
import { InfiniteCarousel } from '@/components/carousels/InfiniteCarousel'
import { FloatingNotes } from '@/components/effects/FloatingNotes'
import { RhythmPulse } from '@/components/effects/RhythmPulse'

export function EffectsDemoPage() {
  const carouselItems = [
    { id: '1', content: <div className="w-64 h-40 bg-accent/20 rounded-xl flex items-center justify-center text-white font-bold">Slide 1</div> },
    { id: '2', content: <div className="w-64 h-40 bg-anime-purple/20 rounded-xl flex items-center justify-center text-white font-bold">Slide 2</div> },
    { id: '3', content: <div className="w-64 h-40 bg-neon-cyan/20 rounded-xl flex items-center justify-center text-white font-bold">Slide 3</div> },
  ]

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <h1 className="text-3xl font-bold text-text-primary text-center mb-12">
        🎨 Demo de Efectos Anime Musicales
      </h1>

      <div className="max-w-4xl mx-auto space-y-16">

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">✨ MusicalParticles</h2>
          <p className="text-text-secondary text-sm mb-4">Partículas de notas musicales flotando por la pantalla</p>
          <div className="h-48 relative rounded-xl overflow-hidden bg-bg-secondary">
            <MusicalParticles count={15} color="text-anime-pink" speed="medium" />
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🖱️ GlowTrail</h2>
          <p className="text-text-secondary text-sm mb-4">Mueve el mouse para ver el rastro de luz</p>
          <div className="h-48 relative rounded-xl overflow-hidden bg-bg-secondary">
            <GlowTrail length={10} color="#c445f6" />
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm">
              Mueve el mouse aquí
            </div>
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">⭐ SparkleEffect</h2>
          <p className="text-text-secondary text-sm mb-4">Destellos tipo estrella por toda la pantalla</p>
          <div className="h-48 relative rounded-xl overflow-hidden bg-bg-secondary">
            <SparkleEffect count={20} maxSize={16} />
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🌊 BackgroundMotion (wave)</h2>
          <p className="text-text-secondary text-sm mb-4">Fondo con animación de ola sutil</p>
          <div className="h-48 relative rounded-xl overflow-hidden">
            <BackgroundMotion variant="wave" className="opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm z-10">
              Fondo animado wave
            </div>
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🌫️ BackgroundMotion (particles)</h2>
          <p className="text-text-secondary text-sm mb-4">Fondo con partículas flotantes</p>
          <div className="h-48 relative rounded-xl overflow-hidden">
            <BackgroundMotion variant="particles" className="opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm z-10">
              Fondo con partículas
            </div>
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">📊 BackgroundMotion (lines)</h2>
          <p className="text-text-secondary text-sm mb-4">Barras animadas tipo equalizador</p>
          <div className="h-48 relative rounded-xl overflow-hidden">
            <BackgroundMotion variant="lines" className="opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm z-10">
              Equalizador animado
            </div>
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🎠 InfiniteCarousel</h2>
          <p className="text-text-secondary text-sm mb-4">Carrusel infinito automático</p>
          <InfiniteCarousel items={carouselItems} speed={15} direction="left" className="py-4" />
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">📜 FloatingNotes + RhythmPulse</h2>
          <p className="text-text-secondary text-sm mb-4">Notas flotantes con pulso rítmico</p>
          <div className="h-48 relative rounded-xl overflow-hidden bg-bg-secondary">
            <FloatingNotes count={10} />
            <div className="absolute top-4 right-4">
              <RhythmPulse active={true} color="rgba(168, 85, 247, 0.5)" />
            </div>
          </div>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🎭 ParallaxContainer</h2>
          <p className="text-text-secondary text-sm mb-4">Capas con diferentes profundidades de parallax (scroll)</p>
          <ParallaxContainer className="h-64 overflow-y-auto bg-bg-secondary rounded-xl" speed={0.5}>
            <ParallaxContainer.Layer depth={0} className="p-4">
              <div className="text-text-primary font-bold">Capa 0 (sin movimiento)</div>
            </ParallaxContainer.Layer>
            <ParallaxContainer.Layer depth={0.2} className="p-4">
              <div className="text-anime-purple font-bold">Capa 0.2 (lento)</div>
            </ParallaxContainer.Layer>
            <ParallaxContainer.Layer depth={0.5} className="p-4">
              <div className="text-anime-pink font-bold">Capa 0.5 (medio)</div>
            </ParallaxContainer.Layer>
            <ParallaxContainer.Layer depth={1} className="p-4">
              <div className="text-neon-cyan font-bold">Capa 1.0 (rápido)</div>
            </ParallaxContainer.Layer>
          </ParallaxContainer>
        </section>

        <section className="border border-border rounded-2xl p-6 bg-bg-card">
          <h2 className="text-xl font-semibold text-accent mb-4">🎬 AnimeSceneTransition</h2>
          <p className="text-text-secondary text-sm mb-4">Transición tipo escena de anime (blur + scale)</p>
          <AnimeSceneTransition className="bg-accent/20 rounded-xl p-8 text-center">
            <div className="text-text-primary font-bold">Contenido con transición anime</div>
          </AnimeSceneTransition>
        </section>

      </div>
    </div>
  )
}