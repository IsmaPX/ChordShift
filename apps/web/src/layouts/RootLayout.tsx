import { useLocation, Outlet } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { AtmosphereBackground } from '@/components/atmosphere/AtmosphereBackground';

export const RootLayout = () => {
  const location = useLocation();

  return (
    <AtmosphereBackground>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </AtmosphereBackground>
  );
};
