import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { buildArticleJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getAllPostSlugs().flatMap((slug) => [
    { locale: "fr", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — The Nice Picnic`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = buildArticleJsonLd(post);
  const date = new Date(post.date).toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />
      <main className="blog-page">
        <article className="sec" style={{ background: "var(--bg)" }}>
          <div className="sec-inner blog-article">
            <p className="tag">{post.category}</p>
            <h1 className="t font-[family-name:var(--font-cormorant)] text-3xl font-light md:text-4xl">
              {post.title}
            </h1>
            <p className="blog-article-meta">
              {date} · {post.author}
            </p>
            <div className="blog-article-hero">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            </div>
            <MarkdownContent content={post.content} />
            <p className="mt-10 text-center">
              <Link
                href="/blog"
                className="text-sm text-[var(--terra)] underline-offset-4 hover:underline"
              >
                {t("blog.back")}
              </Link>
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
