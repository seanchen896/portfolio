"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PortfolioModeToggle } from "./PortfolioMode";
import { useEffect, useRef, useState } from "react";
import { ContactPrompt } from "./ContactPrompt";
import { site } from "@/lib/site";

export function SiteHeader({ theme: _theme }: { theme?: "light" | "dark" }) {
  const photography = usePathname().startsWith("/photography");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<"about" | "contact">("about");
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  function finishClose() {
    clearTimeout(closeTimer.current);
    dialog.current?.close();
    dialog.current?.removeAttribute("data-closing");
  }
  function close() {
    if (!dialog.current?.open || dialog.current.dataset.closing) return;
    if (panel !== "about" || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off") { finishClose(); return; }
    dialog.current.dataset.closing = "true";
    closeTimer.current = setTimeout(finishClose, 420);
  }
  function open(value: "about" | "contact", trigger: HTMLElement) {
    opener.current = trigger;
    clearTimeout(closeTimer.current);
    dialog.current?.removeAttribute("data-closing");
    setPanel(value);
    setIsOpen(true);
    dialog.current?.showModal();
  }
  return <>
    <header className="portfolio-header">
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="portfolio-brand">
        <Link className="portfolio-name" href="/">{site.shortName}</Link>
        <button className="role-link" onClick={event => open("about", event.currentTarget)} aria-label="About Sean — Mechanical Engineer" aria-haspopup="dialog">
          <span className="role-rest">{photography ? "Photography" : "Mechanical Engineer"}</span><span className="role-hover" aria-hidden="true">About me ↗</span>
        </button>
      </div>
      <div className="header-actions"><button className="btn text-link contact-trigger" onClick={event => open("contact", event.currentTarget)} aria-haspopup="dialog">Contact</button><PortfolioModeToggle /></div>
    </header>
    <dialog ref={dialog} className="portfolio-dialog" data-panel={panel} aria-labelledby="panel-title" onCancel={event => { event.preventDefault(); close(); }} onClose={() => { setIsOpen(false); clearTimeout(closeTimer.current); dialog.current?.removeAttribute("data-closing"); if (!dialog.current?.open) opener.current?.focus({ preventScroll: true }); }} onAnimationEnd={event => { if (event.target === dialog.current && event.animationName === "about-drawer-out" && dialog.current.dataset.closing) finishClose(); }} onClick={event => {
      if (event.target !== dialog.current) return;
      if (panel === "contact") { close(); return; }
      const bounds = dialog.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
      <div className="dialog-surface">
        <div className="dialog-top"><span>[{panel === "about" ? "About" : "Contact"}]</span><button autoFocus onClick={close} className="text-link" aria-label="Close dialog">Close <span aria-hidden="true">×</span></button></div>
        <h2 id="panel-title">{panel === "about" ? "About me" : "Let’s talk."}</h2>
        {panel === "about" ? <div className="dialog-copy">{site.about.map(p => <p key={p}>{p}</p>)}<dl className="about-facts">{site.facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></div> : <div className="dialog-copy contact-copy"><ContactPrompt active={isOpen && panel === "contact"} /><div className="contact-emails"><a className="contact-email text-link" href={`mailto:${site.email}`}>{site.email} ↗</a><a className="contact-email text-link" href={`mailto:${site.schoolEmail}`}>{site.schoolEmail} ↗</a></div><p className="contact-location">{site.location}</p></div>}
        <div className="dialog-links"><a className="text-link" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="text-link" href={site.github} target="_blank" rel="noreferrer">GitHub ↗</a><a className="text-link" href={site.resume} target="_blank" rel="noreferrer">Résumé ↗</a></div>
      </div>
    </dialog>
  </>;
}
