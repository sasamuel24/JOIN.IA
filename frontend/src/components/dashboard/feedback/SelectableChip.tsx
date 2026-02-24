'use client';

import { Chip } from '@/components/ui/chip';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}

export function SelectableChip({ label, selected, onToggle, icon }: SelectableChipProps) {
  return <Chip label={label} selected={selected} onToggle={onToggle} icon={icon} />;
}
