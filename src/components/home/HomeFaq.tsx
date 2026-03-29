"use client";

import { useMessages } from "next-intl";
import { useState } from "react";

type FaqItem = { q: string; a: string };

export function HomeFaq() {
  const messages = useMessages() as { Faq: { items: FaqItem[] } };
  const items = messages.Faq.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className={`faq-item ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <h4>{item.q}</h4>
              <span className="faq-tog" aria-hidden>
                +
              </span>
            </button>
            <div className="faq-a">
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
