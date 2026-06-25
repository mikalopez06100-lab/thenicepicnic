import type { FaqCategory } from "@/lib/faq-data";
import { FaqAccordion } from "./FaqAccordion";

type Props = {
  categories: FaqCategory[];
};

export function FaqCategories({ categories }: Props) {
  return (
    <div className="faq-categories">
      {categories.map((category) => (
        <section key={category.id} className="faq-category">
          <h3 className="faq-category-title">{category.title}</h3>
          <FaqAccordion items={category.items} />
        </section>
      ))}
    </div>
  );
}
