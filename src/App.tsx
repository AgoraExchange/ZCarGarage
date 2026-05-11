import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const SPLASH_DURATION_MS = 3000;
const appIconUrl = `${import.meta.env.BASE_URL}nismoflasher.png`;

const SplashScreen = () => (
  <div className="splash-screen" role="status" aria-label="Loading NISMO Tuner OS">
    <div className="splash-grid" aria-hidden="true" />
    <div className="splash-content">
      <img className="splash-logo" src={appIconUrl} alt="NISMO Tuner OS" />
      <div className="splash-progress" aria-hidden="true">
        <span />
      </div>
      <div className="splash-title-lockup">
        <div className="splash-car">370z</div>
        <div className="splash-credit">Tuned By ZCarGarage</div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
