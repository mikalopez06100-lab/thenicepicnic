import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  imageAlt: string;
  locale: string;
};

export type BlogPost = BlogPostMeta & { content: string };

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function parseFile(filename: string): BlogPost | null {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) || filename.replace(/\.mdx?$/, "");

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    author: data.author as string,
    category: data.category as string,
    tags: (data.tags as string[]) ?? [],
    image: data.image as string,
    imageAlt: data.imageAlt as string,
    locale: (data.locale as string) ?? "fr",
    content: content.trim(),
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => parseFile(f)?.slug)
    .filter((s): s is string => Boolean(s));
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  for (const f of fs.readdirSync(BLOG_DIR)) {
    if (!f.endsWith(".mdx") && !f.endsWith(".md")) continue;
    const post = parseFile(f);
    if (post?.slug === slug) return post;
  }
  return null;
}

export function getAllPosts(locale?: string): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => parseFile(f))
    .filter((p): p is BlogPost => p != null);

  const filtered = locale
    ? posts.filter((p) => p.locale === locale || p.locale === "all")
    : posts;

  return filtered
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ content: _c, ...meta }) => meta);
}
