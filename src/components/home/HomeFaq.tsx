import type { FaqItem } from "@/lib/faq-data";
import { FaqAccordion } from "@/components/faq/FaqAccordion";

type Props = {
  items: FaqItem[];
};

export function HomeFaq({ items }: Props) {
  return <FaqAccordion items={items} />;
}
