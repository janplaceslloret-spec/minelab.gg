import { useEffect } from 'react';

/**
 * Mutates document <head> for the current page.
 * Removes injected tags on unmount so the next route gets a clean slate.
 *
 * Note: Google renders JS, so this works for SEO. TikTok/Discord/WhatsApp
 * scrapers don't run JS — for those we'd need static prerender (vite-plugin-ssg).
 * As a compromise, public landings get static <head> at build time only via
 * react-helmet won't help. This hook is best-effort for runtime.
 */
export function useDocumentMeta({ title, description, canonical, og = {}, twitter = {}, jsonLd = [] }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    const created = [];
    const setOrCreateMeta = (selector, attrs) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
        created.push(el);
      } else {
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      }
      return el;
    };

    const setOrCreateLink = (rel, href) => {
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute('href', href);
      return el;
    };

    if (description) setOrCreateMeta('meta[name="description"]', { name: 'description', content: description });
    if (canonical) setOrCreateLink('canonical', canonical);

    Object.entries(og).forEach(([key, value]) => {
      if (!value) return;
      setOrCreateMeta(`meta[property="og:${key}"]`, { property: `og:${key}`, content: String(value) });
    });

    Object.entries(twitter).forEach(([key, value]) => {
      if (!value) return;
      setOrCreateMeta(`meta[name="twitter:${key}"]`, { name: `twitter:${key}`, content: String(value) });
    });

    const scripts = [];
    (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean).forEach((data) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.dynamicSeo = '1';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      scripts.push(s);
    });

    return () => {
      document.title = previousTitle;
      created.forEach((el) => el.remove());
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, canonical, JSON.stringify(og), JSON.stringify(twitter), JSON.stringify(jsonLd)]);
}
