import type { ReactElement, SVGProps } from "react";

export type IconName =
  | "pages"
  | "about"
  | "home"
  | "site"
  | "nav"
  | "template"
  | "export"
  | "sidebar"
  | "inspect"
  | "plus"
  | "search"
  | "chevron"
  | "chevdown"
  | "grip"
  | "x"
  | "check"
  | "bold"
  | "italic"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "hr"
  | "table"
  | "quote"
  | "code"
  | "codeBlock"
  | "link"
  | "list"
  | "listOrd"
  | "image"
  | "folder"
  | "settings"
  | "moon"
  | "sun"
  | "star"
  | "duplicate"
  | "trash"
  | "rocket";

const PATHS: Record<IconName, ReactElement> = {
  pages: (
    <>
      <path d="M4 3h7l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M11 3v3h3" />
    </>
  ),
  about: (
    <>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M9 8.5v3" />
      <circle cx="9" cy="6.2" r=".6" fill="currentColor" />
    </>
  ),
  home: (
    <>
      <path d="M3 8.5 9 3.5l6 5V14a1 1 0 0 1-1 1h-3v-4H7v4H4a1 1 0 0 1-1-1z" />
    </>
  ),
  site: (
    <>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M2.5 9h13M9 2.5c2 2 3 4.2 3 6.5s-1 4.5-3 6.5c-2-2-3-4.2-3-6.5s1-4.5 3-6.5z" />
    </>
  ),
  nav: <path d="M3 5h12M3 9h12M3 13h8" />,
  template: (
    <>
      <rect x="3" y="3" width="12" height="4" rx="1" />
      <rect x="3" y="9" width="5" height="6" rx="1" />
      <rect x="10" y="9" width="5" height="6" rx="1" />
    </>
  ),
  export: <path d="M9 11V3M5.5 6.5 9 3l3.5 3.5M3.5 11.5V14a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2.5" />,
  sidebar: (
    <>
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" />
      <path d="M7 3v12" />
    </>
  ),
  inspect: (
    <>
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" />
      <path d="M11 3v12" />
    </>
  ),
  plus: <path d="M9 4v10M4 9h10" />,
  search: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <path d="m11.5 11.5 3 3" />
    </>
  ),
  chevron: <path d="m6 4 4 5-4 5" />,
  chevdown: <path d="m4 6 5 4 5-4" />,
  grip: (
    <>
      <circle cx="6.5" cy="5" r=".9" fill="currentColor" />
      <circle cx="6.5" cy="9" r=".9" fill="currentColor" />
      <circle cx="6.5" cy="13" r=".9" fill="currentColor" />
      <circle cx="11.5" cy="5" r=".9" fill="currentColor" />
      <circle cx="11.5" cy="9" r=".9" fill="currentColor" />
      <circle cx="11.5" cy="13" r=".9" fill="currentColor" />
    </>
  ),
  x: <path d="m4 4 10 10M14 4 4 14" />,
  check: <path d="m4 9 3.5 3.5L14 6" />,
  bold: <path d="M5 3h4.5a3 3 0 0 1 0 6H5zM5 9h5a3 3 0 0 1 0 6H5z" />,
  italic: <path d="M11 3H7M11 15H6M9 3 7 15" />,
  h1: <path d="M3 4v10M9 4v10M3 9h6M12 6l1.5-1V14" />,
  h2: <path d="M3 4v10M9 4v10M3 9h6M12 7a1.5 1.5 0 1 1 3 0c0 1.5-3 2.5-3 5h3" />,
  h3: <path d="M3 4v10M9 4v10M3 9h6M12 6h3l-2 3a1.5 1.5 0 1 1-1.5 2.5" />,
  h4: <path d="M3 4v10M9 4v10M3 9h6M12 5v5h4M15 5v9" />,
  hr: <path d="M3 9h12" />,
  table: (
    <>
      <rect x="2.5" y="3.5" width="13" height="11" rx="1" />
      <path d="M2.5 8h13M2.5 11.5h13M6.5 8v6.5M11.5 8v6.5" />
    </>
  ),
  quote: <path d="M5 5h3v4l-2 4M11 5h3v4l-2 4" />,
  code: <path d="m6 6-3 3 3 3M12 6l3 3-3 3M10 4 8 14" />,
  codeBlock: (
    <>
      <rect x="2.5" y="3.5" width="13" height="11" rx="1.5" />
      <path d="M5 7l-1.5 2L5 11M13 7l1.5 2L13 11M10.5 6.5 8 11.5" />
    </>
  ),
  link: (
    <path d="M8 11a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1M10 7a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" />
  ),
  list: (
    <>
      <path d="M6 5h9M6 9h9M6 13h9" />
      <circle cx="3" cy="5" r=".9" fill="currentColor" />
      <circle cx="3" cy="9" r=".9" fill="currentColor" />
      <circle cx="3" cy="13" r=".9" fill="currentColor" />
    </>
  ),
  listOrd: <path d="M6 5h9M6 9h9M6 13h9M2.5 4v3M2 4h1M2 7h1.5M2 10h1.5l-1.5 2h1.5" />,
  image: (
    <>
      <rect x="2.5" y="3.5" width="13" height="11" rx="1.5" />
      <circle cx="6.5" cy="7" r="1" />
      <path d="m3 13 3.5-3.5L9 12l3-3 3 3.5" />
    </>
  ),
  folder: (
    <path d="M2.5 5a1 1 0 0 1 1-1H7l1.5 1.5h6a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />
  ),
  settings: (
    <>
      <circle cx="9" cy="9" r="2" />
      <path d="M9 1.5v2M9 14.5v2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M1.5 9h2M14.5 9h2M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" />
    </>
  ),
  moon: <path d="M14 10.5A6 6 0 0 1 7.5 4 6 6 0 1 0 14 10.5z" />,
  sun: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M9 1.5v2M9 14.5v2M3.5 3.5l1.4 1.4M13.1 13.1l1.4 1.4M1.5 9h2M14.5 9h2M3.5 14.5l1.4-1.4M13.1 4.9l1.4-1.4" />
    </>
  ),
  star: <path d="M9 2.5l2 4.4 4.8.5-3.6 3.3 1 4.7L9 13.1l-4.2 2.3 1-4.7L2.2 7.4l4.8-.5z" />,
  duplicate: (
    <>
      <rect x="5" y="5" width="10" height="10" rx="1.5" />
      <path d="M3 11V4a1 1 0 0 1 1-1h7" />
    </>
  ),
  trash: <path d="M3.5 5h11M7 5V3.5h4V5M5 5l.6 9a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1L13 5" />,
  rocket: (
    <>
      <path d="M9 13s-3.5-1-3.5-5S9 2 9 2s3.5 2 3.5 6S9 13 9 13z" />
      <path d="M5.5 9.5 4 11l1.5 1.5M12.5 9.5 14 11l-1.5 1.5" />
      <circle cx="9" cy="7" r="1" />
    </>
  ),
};

type Props = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 16, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 18 18"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
