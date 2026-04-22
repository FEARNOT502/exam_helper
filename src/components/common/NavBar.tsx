import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️';
  const themeLabel = theme === 'dark' ? '다크' : theme === 'light' ? '라이트' : '시스템';

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={`현재: ${themeLabel} 모드`}
    >
      <span>{themeIcon}</span>
    </button>
  );
}
