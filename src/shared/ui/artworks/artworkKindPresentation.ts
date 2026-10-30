import { Box, Paintbrush, ScanLine } from 'lucide-react';

export const artworkKindPresentation = {
  drawing: { Icon: Paintbrush, titleKey: 'profile.drawing', descriptionKey: 'profile.drawingDescription', emptyKey: 'profile.drawingEmpty', actionKey: 'profile.drawingAction', path: '/resources', query: { kind: 'coloring' } },
  scan: { Icon: ScanLine, titleKey: 'profile.scan', descriptionKey: 'profile.scanDescription', emptyKey: 'profile.scanEmpty', actionKey: 'profile.scanAction', path: '/creative/scan', query: {} },
  habitat: { Icon: Box, titleKey: 'profile.habitat', descriptionKey: 'profile.habitatDescription', emptyKey: 'profile.habitatEmpty', actionKey: 'profile.habitatAction', path: '/creative/habitat', query: {} },
};

export const formatSavedDate = (value: number | null, locale: string) => value === null ? null : new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(value);
