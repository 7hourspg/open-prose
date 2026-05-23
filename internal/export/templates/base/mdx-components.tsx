import type { MDXComponents } from "mdx/types";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  TableHTMLAttributes,
} from "react";
import NextImage from "next/image";
import { site } from "@/lib/site";

function isExternal(href: string | undefined): boolean {
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#")) return false;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const dest = new URL(href);
    const home = new URL(site.url);
    return dest.host !== home.host;
  } catch {
    return true;
  }
}

export const mdxComponents: MDXComponents = {
  img: ({ alt, src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
    const caption = typeof alt === "string" ? alt.trim() : "";
    // eslint-disable-next-line @next/next/no-img-element
    const img = (
      <img
        src={src as string}
        alt={caption}
        loading="lazy"
        decoding="async"
        {...rest}
      />
    );
    if (!caption) return img;
    return (
      <figure className="prose-figure">
        {img}
        <figcaption>{caption}</figcaption>
      </figure>
    );
  },
  Image: NextImage,
  table: ({ children, ...rest }: TableHTMLAttributes<HTMLTableElement>) => (
    <div className="prose-table-wrap">
      <table {...rest}>{children}</table>
    </div>
  ),
  a: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (isExternal(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...mdxComponents };
}
