"use client";
import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const Toaster = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <SonnerToaster />;
};

export default Toaster;
