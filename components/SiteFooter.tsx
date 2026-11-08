"use client";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
export function SiteFooter({ theme: _theme, projectColor = false }: { theme?: "light" | "dark"; projectColor?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  function toggleTheme() {
    const value = !dark; setDark(value); document.documentElement.dataset.theme = value ? "dark" : "light";
    try { localStorage.setItem("portfolio-theme", value ? "dark" : "light"); } catch {}
  }
  return <footer className="portfolio-footer">
    {projectColor ? <span className="theme-control"><span className="theme-dot" />Project</span> : <button onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} className="theme-control"><span className="theme-dot" />{dark ? "Dark" : "Light"}</button>}
    <div className="footer-center"><a className="resume-link text-link" href={site.resume} download="Sean-Chen-Resume.pdf" aria-label="Download résumé"><span className="resume-label-full">Download résumé ↓</span><span className="resume-label-short" aria-hidden="true">Résumé ↓</span></a></div>
    <div className="footer-right">{process.env.NODE_ENV === "development" && <a className="editor-link text-link" href="/editor">Edit projects ↗</a>}</div>
  </footer>;
}
