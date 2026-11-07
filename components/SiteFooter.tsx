"use client";
import { useEffect, useState } from "react";
export function SiteFooter({ theme: _theme, projectColor = false }: { theme?: "light" | "dark"; projectColor?: boolean }) {
  const [dark, setDark] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); setStill(document.documentElement.dataset.motion === "off"); }, []);
  function toggleTheme() {
    const value = !dark; setDark(value); document.documentElement.dataset.theme = value ? "dark" : "light";
    try { localStorage.setItem("portfolio-theme", value ? "dark" : "light"); } catch {}
  }
  function toggleMotion() {
    const value = !still; setStill(value); document.documentElement.dataset.motion = value ? "off" : "on";
    try { localStorage.setItem("portfolio-motion", value ? "off" : "on"); } catch {}
  }
  return <footer className="portfolio-footer">
    {projectColor ? <span className="theme-control"><span className="theme-dot" />Project</span> : <button onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} className="theme-control"><span className="theme-dot" />{dark ? "Dark" : "Light"}</button>}
    <div className="footer-center"><button onClick={toggleMotion} aria-pressed={!still} aria-label={still ? "Enable animations" : "Pause animations"} className="motion-control"><span aria-hidden="true">{still ? "▷" : "Ⅱ"}</span><span>Motion {still ? "off" : "on"}</span></button>{process.env.NODE_ENV === "development" && <a className="editor-link text-link" href="/editor">Edit projects ↗</a>}</div>
    <span className="copyright">©{new Date().getFullYear()}</span>
  </footer>;
}
