import { useEffect, useRef } from 'react';
export function useCreativeLeaveGuard(dirty: boolean) {
  const current = useRef(dirty); current.current = dirty;
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (current.current) { event.preventDefault(); event.returnValue = ''; } };
    const navigate = (event: Event) => { if (current.current && !window.confirm('Có thay đổi chưa lưu. Bỏ thay đổi và rời trang?')) event.preventDefault(); };
    window.addEventListener('beforeunload', unload); window.addEventListener('bluesteam:before-navigate', navigate);
    return () => { window.removeEventListener('beforeunload', unload); window.removeEventListener('bluesteam:before-navigate', navigate); };
  }, []);
  return () => { current.current = false; };
}
