'use client';

interface Props {
  label: string;
  selected: boolean;
  correct: boolean | null;
  disabled: boolean;
  onClick: () => void;
}

export default function OptionButton({ label, selected, correct, disabled, onClick }: Props) {
  let base =
    'w-full text-left px-4 py-4 rounded-xl border text-base leading-relaxed transition-colors duration-150 ';

  if (disabled) {
    if (correct === true) {
      base += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    } else if (selected && correct === false) {
      base += 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300';
    } else {
      base += 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500';
    }
  } else {
    base += selected
      ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200'
      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200';
  }

  return (
    <button className={base} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
