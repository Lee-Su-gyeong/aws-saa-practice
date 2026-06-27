'use client';

interface Props {
  label: string;
  selected: boolean;
  correct: boolean | null; // null = 아직 제출 안 함
  disabled: boolean;
  onClick: () => void;
}

export default function OptionButton({ label, selected, correct, disabled, onClick }: Props) {
  let base =
    'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ';

  if (disabled) {
    if (correct === true) {
      base += 'border-green-500 bg-green-900/30 text-green-300';
    } else if (selected && correct === false) {
      base += 'border-red-500 bg-red-900/30 text-red-300';
    } else {
      base += 'border-gray-700 bg-gray-800/40 text-gray-400';
    }
  } else {
    base += selected
      ? 'border-orange-400 bg-orange-900/30 text-orange-200'
      : 'border-gray-700 bg-gray-800 hover:border-orange-500 hover:bg-gray-700 cursor-pointer';
  }

  return (
    <button className={base} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
