import type { FaqItem } from "@/lib/faq-data";

type Props = {
  items: FaqItem[];
  className?: string;
};

export function FaqAccordion({ items, className = "" }: Props) {
  return (
    <div className={`faq-list ${className}`.trim()}>
      {items.map((item) => (
        <details key={item.id} className="faq-item">
          <summary className="faq-q">
            <h4>{item.q}</h4>
            <span className="faq-tog" aria-hidden>
              +
            </span>
          </summary>
          <div className="faq-a">
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
