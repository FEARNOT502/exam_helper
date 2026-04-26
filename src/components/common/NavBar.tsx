import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  // minimal line icons (no emoji) — matches new aesthetic
  const icon =
    theme === 'dark' ? (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9.5A5 5 0 018 3.5a5 5 0 105 6z" />
      </svg>
    ) : theme === 'light' ? (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.5 3.5l.7.7M11.8 11.8l.7.7M3.5 12.5l.7-.7M11.8 4.2l.7-.7" />
      </svg>
    ) : (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="12" height="9" rx="1.5" />
        <path d="M6 14h4M8 12v2" />
      </svg>
    );

  const themeLabel = theme === 'dark' ? '다크' : theme === 'light' ? '라이트' : '시스템';

  return (
    <button
      onClick={cycleTheme}
      className="eh-icon-btn"
      title={`현재: ${themeLabel} 모드`}
    >
      {icon}
    </button>
  );
}
