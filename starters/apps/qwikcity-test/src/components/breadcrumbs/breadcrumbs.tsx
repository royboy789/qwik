import { component$, useStyles$ } from '@builder.io/qwik';
import { Link, useContent, useLocation, ContentMenu } from '@builder.io/qwik-city';
import styles from './breadcrumbs.css?inline';

export const Breadcrumbs = component$(() => {
  useStyles$(styles);

  const { menu } = useContent();
  const { pathname } = useLocation();

  const breadcrumbs = createBreadcrumbs(menu, pathname);
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav class="breadcrumbs">
      {breadcrumbs.map((b, i) => (
        <span data-test-breadcrumb={i}>
          {b.href ? <Link href={b.href}>{b.text}</Link> : b.text}
        </span>
      ))}
    </nav>
  );
});

export function createBreadcrumbs(menu: ContentMenu | undefined, pathname: string) {
  if (menu?.items) {
    for (const breadcrumbA of menu.items) {
      if (matchesHref(breadcrumbA.href, pathname)) {
        return [breadcrumbA];
      }

      if (breadcrumbA.items) {
        for (const breadcrumbB of breadcrumbA.items) {
          if (matchesHref(breadcrumbB.href, pathname)) {
            return [breadcrumbA, breadcrumbB];
          }

          if (breadcrumbB.items) {
            for (const breadcrumbC of breadcrumbB.items) {
              if (matchesHref(breadcrumbC.href, pathname)) {
                return [breadcrumbA, breadcrumbB, breadcrumbC];
              }
            }
          }
        }
      }
    }
  }

  return [];
}

function matchesHref(href: string | undefined, pathname: string) {
  if (href) {
    if (href.endsWith('/') && !pathname.endsWith('/')) {
      pathname += '/';
    } else if (!href.endsWith('/') && pathname.endsWith('/')) {
      href += '/';
    }
  }
  return href === pathname;
}
