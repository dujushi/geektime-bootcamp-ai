export interface NavItem {
  label: string;
  href: string;
  subitems?: NavItem[];
}

export const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '课程大纲', href: '/curriculum' },
  { label: '工具生态', href: '/tools' },
  { label: '实战项目', href: '/projects' },
  { label: '关于', href: '/about' },
];
