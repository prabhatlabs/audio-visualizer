"use client";

import App from "@/components/App";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme-key">
      <App />
    </ThemeProvider>
  );
}
