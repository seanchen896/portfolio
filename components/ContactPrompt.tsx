"use client";

import { useEffect, useState } from "react";

const words = ["projects", "opportunities", "conversation"];
const timing = { start: 300, type: [105, 80, 115, 85], erase: 45, hold: 1400, between: 300 };

export function ContactPrompt({ active }: { active: boolean }) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) { setText(""); return; }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    let count = 0;
    let deleting = false;
    function step() {
      count += deleting ? -1 : 1;
      setText(words[index].slice(0, count));
      let delay = deleting ? timing.erase : timing.type[count % timing.type.length];
      if (!deleting && count === words[index].length) { deleting = true; delay = timing.hold; }
      else if (deleting && count === 0) { deleting = false; index = (index + 1) % words.length; delay = timing.between; }
      timer = setTimeout(step, delay);
    }
    function start() {
      clearTimeout(timer);
      index = count = 0; deleting = false;
      if (preference.matches) { setText(words[0]); return; }
      setText(""); timer = setTimeout(step, timing.start);
    }
    start();
    preference.addEventListener("change", start);
    return () => { clearTimeout(timer); preference.removeEventListener("change", start); };
  }, [active]);
  return <p className="contact-question">
    <span className="sr-only">Shall we talk about projects, opportunities, or a conversation?</span>
    <span aria-hidden="true">Shall we talk about<span className="contact-word"><span className="contact-typed">{text}</span><span className="contact-cursor" />?</span></span>
  </p>;
}
