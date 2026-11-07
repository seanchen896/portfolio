"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { site } from "@/lib/site";

export function SiteHeader({ theme: _theme }: { theme?: "light" | "dark" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<"about" | "contact">("about");
  function open(value: "about" | "contact") { setPanel(value); dialog.current?.showModal(); }
  return <>
    <header className="portfolio-header">
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="portfolio-brand">
        <Link className="portfolio-name" href="/">{site.shortName}</Link>
        <button className="role-link" onClick={() => open("about")} aria-label="About Sean — Mechanical Engineer" aria-haspopup="dialog">
          <span className="role-rest">Mechanical Engineer</span><span className="role-hover" aria-hidden="true">About me ↗</span>
        </button>
      </div>
      <button className="btn text-link" onClick={() => open("contact")} aria-haspopup="dialog">Contact</button>
    </header>
    <dialog ref={dialog} className="portfolio-dialog" aria-labelledby="panel-title" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="dialog-surface">
        <div className="dialog-top"><span>[{panel === "about" ? "About" : "Contact"}]</span><button autoFocus onClick={() => dialog.current?.close()} className="text-link" aria-label="Close dialog">Close ×</button></div>
        <h2 id="panel-title">{panel === "about" ? "Sean Chen." : "Let’s talk."}</h2>
        {panel === "about" ? <div className="dialog-copy"><p>Mechanical engineering student at UC Berkeley.</p>{site.about.map(p => <p key={p}>{p}</p>)}<dl className="about-facts">{site.facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></div> : <div className="dialog-copy"><p>For projects, opportunities, or a conversation about engineering.</p><a className="contact-email text-link" href={`mailto:${site.email}`}>{site.email} ↗</a><p>{site.location}</p></div>}
        <div className="dialog-links"><a className="text-link" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="text-link" href={site.github} target="_blank" rel="noreferrer">GitHub ↗</a><a className="text-link" href={site.resume} target="_blank" rel="noreferrer">Résumé ↗</a></div>
      </div>
    </dialog>
  </>;
}
