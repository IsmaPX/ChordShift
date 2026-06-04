import { useLocation, Outlet } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/transitions/PageTransition';

export const RootLayout = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname} variant="fade">
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
};
