import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  Image as ImageIcon,
  Volume2,
  PlayCircle,
  FileText,
  Palette,
} from 'lucide-react';
import { SearchField } from '../controls/SearchField';

export type ResourceFilterKind =
  | 'all'
  | 'flashcard'
  | 'photo'
  | 'image'
  | 'audio'
  | 'video'
  | 'print'
  | 'printable'
  | 'coloring'
  | 'worksheet'
  | 'poster'
  | 'visual';

export type ResourceFormatFilterKey = ResourceFilterKind;

export interface FormatTabOption {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export const RESOURCE_KIND_TABS: FormatTabOption[] = [
  { key: 'all', label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" /> },
  { key: 'flashcard', label: 'Thẻ hình', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'image', label: 'Hình ảnh', icon: <ImageIcon className="w-4 h-4" /> },
  { key: 'audio', label: 'Âm thanh', icon: <Volume2 className="w-4 h-4" /> },
  { key: 'video', label: 'Video', icon: <PlayCircle className="w-4 h-4" /> },
  { key: 'printable', label: 'Bản in', icon: <FileText className="w-4 h-4" /> },
];

export const LEARNER_RESOURCE_TABS: FormatTabOption[] = [
  { key: 'visual', label: 'Thẻ hình', icon: <BookOpen className="w-7 h-7" /> },
  { key: 'audio', label: 'Âm thanh', icon: <Volume2 className="w-7 h-7" /> },
  { key: 'video', label: 'Video', icon: <PlayCircle className="w-7 h-7" /> },
  { key: 'coloring', label: 'Tranh tô màu', icon: <Palette className="w-7 h-7" /> },
  { key: 'poster', label: 'Poster', icon: <FileText className="w-7 h-7" /> },
];

export interface CatalogToolbarProps {
  formatTabs?: FormatTabOption[];
  tabs?: FormatTabOption[];
  role?: 'learner' | 'teacher';
  selectedFormat?: string;
  activeFormat?: string;
  activeTab?: string;
  onSelectFormat?: (format: any) => void;
  onSelectTab?: (format: any) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  totalCount?: number;
  rightSlot?: React.ReactNode;
  ariaLabel?: string;
}

export function CatalogToolbar({
  formatTabs,
  tabs,
  role,
  selectedFormat,
  activeFormat,
  activeTab,
  onSelectFormat,
  onSelectTab,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm theo tên...',
  totalCount,
  rightSlot,
  ariaLabel = 'Lọc theo định dạng',
}: CatalogToolbarProps) {
  const resolvedTabs =
    formatTabs ||
    tabs ||
    (role === 'learner' ? LEARNER_RESOURCE_TABS : RESOURCE_KIND_TABS);

  const currentFormat = selectedFormat ?? activeFormat ?? activeTab ?? 'all';
  const learnerToolbar = role === 'learner';
  const handleSelect = (key: string) => {
    if (onSelectFormat) onSelectFormat(key);
    else if (onSelectTab) onSelectTab(key);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Format Segmented Tabs */}
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={
            learnerToolbar
              ? 'flex w-full items-center justify-between gap-1 overflow-x-auto border-b border-[#12384B]/10 pb-3'
              : 'inline-flex flex-wrap items-center gap-1.5 bg-[#EFEAE1] p-1.5 rounded-full border border-[#12384B]/10 w-fit'
          }
        >
          {resolvedTabs.map((tab) => {
            const active = currentFormat === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={learnerToolbar ? (active || (!resolvedTabs.some(item => item.key === currentFormat) && tab.key === resolvedTabs[0]?.key) ? 0 : -1) : undefined}
                onKeyDown={learnerToolbar ? (event) => {
                  const index = resolvedTabs.findIndex((item) => item.key === tab.key);
                  const nextIndex = event.key === 'ArrowRight' ? (index + 1) % resolvedTabs.length
                    : event.key === 'ArrowLeft' ? (index - 1 + resolvedTabs.length) % resolvedTabs.length
                    : event.key === 'Home' ? 0 : event.key === 'End' ? resolvedTabs.length - 1 : -1;
                  if (nextIndex < 0) return;
                  event.preventDefault();
                  const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                  buttons?.[nextIndex]?.focus();
                  handleSelect(resolvedTabs[nextIndex].key);
                } : undefined}
                onClick={() => handleSelect(tab.key)}
                className={`${
                  learnerToolbar
                    ? 'min-h-[52px] px-6 sm:px-9 rounded-[20px] text-sm sm:text-base'
                    : 'h-10 min-h-[40px] px-4 rounded-full text-xs sm:text-sm'
                } font-bold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#17657A] cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? learnerToolbar
                      ? 'bg-[#D8EDF0] text-[#12384B]'
                      : 'bg-[#15586E] text-white shadow-xs'
                    : learnerToolbar
                      ? 'text-[#12384B] hover:bg-[#D8EDF0]/55'
                      : 'text-[#12384B] hover:bg-white/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#12384B]/10 text-[#436475]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input + Right Actions */}
        {(onSearchChange || typeof totalCount === 'number' || rightSlot) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {onSearchChange && (
              <SearchField
                className="min-w-[min(100%,240px)] sm:min-w-[280px] flex-1 sm:flex-initial text-sm font-semibold"
                label={searchPlaceholder}
                value={searchQuery}
                onChange={onSearchChange}
              />
            )}

            {typeof totalCount === 'number' && (
              <span className="text-xs sm:text-sm font-bold text-[#436475] px-2">
                {totalCount} mục
              </span>
            )}

            {rightSlot}
          </div>
        )}
      </div>

    </div>
  );
}
