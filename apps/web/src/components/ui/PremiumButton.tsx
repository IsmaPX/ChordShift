import { forwardRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const PremiumButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function PremiumButton({ children, variant = 'primary', size = 'md', className, ...props }, ref) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `bg-accent text-white font-semibold rounded-xl 
              shadow-[0_0_20px_rgba(34,197,94,0.3)] 
              hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] 
              hover:bg-accent-hover
              active:scale-[0.98]`,
    secondary: `bg-white/5 text-white font-medium rounded-xl 
                border border-white/10 
                hover:bg-white/8 hover:border-white/20
                active:scale-[0.98]`,
    ghost: `text-white/70 hover:text-white font-medium 
            hover:bg-white/5 rounded-xl 
            active:scale-[0.98]`,
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
});
