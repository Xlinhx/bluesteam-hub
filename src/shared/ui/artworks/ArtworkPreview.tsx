import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export type PreviewStatus = 'loading' | 'loaded' | 'error';
interface Props { src: string; alt: string; lazy?: boolean; onStatusChange?: (status: PreviewStatus) => void }

export function ArtworkPreview(props: Props) { return <PreviewImage key={props.src} {...props} />; }
function PreviewImage({ src, alt, lazy, onStatusChange }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<PreviewStatus>(src ? 'loading' : 'error');
  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);
  return <div className={`artwork-preview artwork-preview-${status}`} aria-busy={status === 'loading'}>
    {status !== 'error' && <img src={src} alt={alt} loading={lazy ? 'lazy' : 'eager'} onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />}
    {status === 'error' && <span className="artwork-preview-fallback"><ImageOff aria-hidden="true" /><span>{t('profile.imageError')}</span></span>}
  </div>;
}
