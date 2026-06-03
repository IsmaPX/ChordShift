import { Outlet } from 'react-router';
import { GlassCard } from '@/components/ui/GlassCard';

export function AuthLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <Outlet />
        </GlassCard>
      </div>
    </div>
  );
}
