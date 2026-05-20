import { Link } from 'react-router'
import { motion } from 'framer-motion'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-text-primary font-medium">Worship Piano</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Practica. Entrena. Adora.
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            La herramienta definitiva para músicos de adoración. 
            Practica canciones, entrena tu oído y domina los estilos.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              to="/register"
              className="w-full py-3 px-6 bg-accent text-white font-medium rounded-xl text-center hover:bg-accent/90 transition-colors"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/login"
              className="w-full py-3 px-6 bg-bg-secondary border border-border text-text-primary font-medium rounded-xl text-center hover:border-accent/50 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl"
        >
          {[
            { title: 'Práctica', desc: 'Visualiza acordes en tiempo real' },
            { title: 'Ear Training', desc: 'Entrena识别 intervalos y acordes' },
            { title: 'Enciclopedia', desc: 'Domina 8 estilos de adoración' },
          ].map((feature, index) => (
            <div key={index} className="p-4 bg-bg-secondary rounded-xl border border-border">
              <h3 className="text-text-primary font-medium mb-1">{feature.title}</h3>
              <p className="text-text-secondary text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}