/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Jobs from "./pages/JobsFixed";
import JobDetail from "./pages/JobDetail";
import Employers from "./pages/Employers";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import NotFound from "./pages/NotFound";
import Loading from "./components/Loading";

const queryClient = new QueryClient();

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  React.useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(t);
  }, [hash, pathname]);
  return null;
}

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
        >
          <BrowserRouter>
            <ScrollToHash />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobsfixed" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/employers" element={<Employers />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
