import profile from '../data/profile.json';
import projectData from '../data/projects.json';

export type Locale = 'zh' | 'en';
export type Project = (typeof projectData)[number];
export const projects = projectData;
export { profile };
export const text = <T,>(locale: Locale, zh: T, en: T): T => locale === 'zh' ? zh : en;
export function route(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${locale === 'en' ? '/en' : ''}/${clean ? `${clean}/` : ''}`;
}
export function alternatePath(pathname: string, target: Locale): string {
  return route(target, pathname.replace(/^\/en(?:\/|$)/, '/'));
}
export function pdfPath(locale: Locale): string {
  return `/downloads/peiyao-duan-${locale}.pdf`;
}
