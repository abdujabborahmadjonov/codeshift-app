export function Icon({ name, size = 16, color = "currentColor" }) {
  const paths = {
    github: <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill={color}/>,
    arrow: <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" fill="none"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="2" fill="none"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    zap: <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" fill={color}/>,
    code: <><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    layers: <><path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" fill="none"/>,
    clock: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
    x: <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>,
    file: <><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke={color} strokeWidth="2" fill="none"/><path d="M13 2v7h7" stroke={color} strokeWidth="2" fill="none"/></>,
    history: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
    refresh: <><path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M17 8l-5-5-5 5M12 3v12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
    search: <><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{paths[name]}</svg>;
}

export function Toast({ message, type = "default" }) {
  if (!message) return null;
  return <div className={`toast toast-${type}`}>{message}</div>;
}
