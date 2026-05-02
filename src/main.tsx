import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import App from "./components/test.tsx";
import "./index.css";
import { ThemeProvider } from "./providers/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider
            defaultTheme="dark"
            storageKey="theme-key"
            children={<App />}
        />
    </StrictMode>,
);
