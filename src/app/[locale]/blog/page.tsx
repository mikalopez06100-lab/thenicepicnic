import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import { getAllPosts } from "@/lib/blog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("blog.title")} — The Nice Picnic`,
    description: t("blog.metaDescription"),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const posts = getAllPosts("fr");

  return (
    <>
      <SiteNav />
      <main className="blog-page">
        <section className="sec" style={{ background: "var(--bg)" }}>
          <div className="sec-inner">
            <p className="tag">{t("blog.tag")}</p>
            <h1 className="t font-[family-name:var(--font-cormorant)] text-4xl font-light md:text-5xl">
              {t("blog.title")}
            </h1>
            <p className="desc">{t("blog.desc")}</p>
            <div className="blog-grid">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-img">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="blog-card-body">
                    <p className="blog-card-tag">{post.category}</p>
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-desc">{post.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-10 text-center">
              <Link
                href="/"
                className="text-sm text-[var(--terra)] underline-offset-4 hover:underline"
              >
                {t("blog.backHome")}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
