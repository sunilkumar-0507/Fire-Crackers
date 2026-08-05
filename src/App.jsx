import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import router from '@/routes';
import SplashScreen from '@/components/fx/SplashScreen';
import { useUIStore } from '@/store/uiStore';

/**
 * The splash gate.
 *
 * The router mounts underneath the splash from the very first frame, so the
 * homepage has finished laying out and warming its fonts by the time the
 * curtain lifts — the handover reads as instant rather than as a second load.
 */
export const App = () => {
  const splashDone = useUIStore((s) => s.splashDone);
  const finishSplash = useUIStore((s) => s.finishSplash);

  return (
    <>
      <div aria-hidden={!splashDone} className={splashDone ? undefined : 'pointer-events-none'}>
        <RouterProvider router={router} />
      </div>

      <AnimatePresence>
        {!splashDone ? <SplashScreen key="splash" onFinish={finishSplash} /> : null}
      </AnimatePresence>

      <Toaster
        position="bottom-center"
        gutter={10}
        containerClassName="!bottom-28 lg:!bottom-8"
        toastOptions={{
          duration: 2600,
          className:
            '!rounded-2xl !border !border-line !bg-white/95 !px-4 !py-3 !text-sm !font-medium !text-ink !shadow-lift !backdrop-blur-md',
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
        }}
      />
    </>
  );
};

export default App;
