import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { useRouter } from '../../../app/router';

/** Keep browser shortcuts while using the application's client router. */
export function PublicLink({ href = '/', onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useRouter();
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download) return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={follow} {...props} />;
}
