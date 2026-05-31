import { FadeIn } from '@/components/animations/FadeIn'
import { SlideReveal } from '@/components/animations/SlideReveal'
import { ScaleReveal } from '@/components/animations/ScaleReveal'
import { FloatingNotes } from '@/components/effects/FloatingNotes'
import { AudioWave } from '@/components/effects/AudioWave'

export const HomePage = () => {
  return (
    <div className="relative min-h-screen">
      <FloatingNotes count={15} />

      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <FadeIn delay={0.2}>
          <h1 className="text-7xl md:text-9xl font-bold">
            <span className="text-gradient-anime">ChordShift</span>
          </h1>
        </FadeIn>

        <SlideReveal direction="up" delay={0.6} className="mt-6">
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl">
            Sumérgete en una experiencia musical anime inmersiva
          </p>
        </SlideReveal>

        <ScaleReveal delay={1} className="mt-12">
          <button className="px-10 py-4 bg-anime-pink text-white rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,110,199,0.5)] hover:scale-110 transition-transform">
            Comenzar viaje
          </button>
        </ScaleReveal>

        <div className="absolute bottom-20">
          <AudioWave />
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SlideReveal direction="left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
              Funcionalidades
            </h2>
          </SlideReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <ScaleReveal key={f.title} delay={i * 0.2}>
                <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:glow-pink transition-all duration-300 group">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-text-secondary">{f.description}</p>
                </div>
              </ScaleReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🎹',
    title: 'Práctica interactiva',
    description: 'Aprende canciones con feedback en tiempo real y visualizaciones dinámicas.',
  },
  {
    icon: '🎵',
    title: 'Entrenamiento auditivo',
    description: 'Mejora tu oído musical con ejercicios generados por IA.',
  },
  {
    icon: '✨',
    title: 'Enciclopedia visual',
    description: 'Explora acordes, escalas y teoría musical con animaciones inmersivas.',
  },
]
