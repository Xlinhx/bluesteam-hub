import { useLayoutEffect, useState, type RefObject } from 'react';

/** Measure intrinsic navigation width, including future registry entries and loaded fonts. */
export function useHeaderLayout(
  headerRef: RefObject<HTMLElement | null>,
  navigationRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const navigation = navigationRef.current;
    if (!header || !navigation || !enabled) return;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const style = getComputedStyle(header);
      const token = (name: string) => parseFloat(style.getPropertyValue(name));
      // Read desktop reservations, so opening/closing the compact controls cannot cause oscillation.
      const required = token('--header-brand-width') + token('--header-actions-width')
        + navigation.getBoundingClientRect().width + 2 * token('--header-group-gap')
        + 2 * parseFloat(style.paddingLeft);
      setCollapsed(window.innerWidth <= 800 || required > header.clientWidth);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(navigation);
    window.addEventListener('resize', measure);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [headerRef, navigationRef, enabled]);

  return enabled && collapsed;
}
