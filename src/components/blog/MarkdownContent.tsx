import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";

type Props = { content: string };

function MarkdownLink({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  if (!href) return <>{children}</>;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="blog-link">
        {children}
      </Link>
    );
  }
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className="blog-link"
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <a href={href} className="blog-link">
      {children}
    </a>
  );
}

export function MarkdownContent({ content }: Props) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <MarkdownLink href={href}>{children}</MarkdownLink>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
