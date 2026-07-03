export const Ico = ({ n, c = "w-5 h-5", style }) => {
  const p = {
    search: <><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M21 21l-4.3-4.3"/></>,
    heart: <path d="M12 20.5S4.5 15.9 2 11.2C.6 8 1.8 4.8 4.8 3.9c2.2-.7 4.4.2 5.6 2.1C11.6 4.1 13.8 3.2 16 3.9c3 .9 4.2 4.1 2.8 7.3C16.3 15.9 12 20.5 12 20.5Z"/>,
    'heart-fill': <path d="M12 20.5S4.5 15.9 2 11.2C.6 8 1.8 4.8 4.8 3.9c2.2-.7 4.4.2 5.6 2.1C11.6 4.1 13.8 3.2 16 3.9c3 .9 4.2 4.1 2.8 7.3C16.3 15.9 12 20.5 12 20.5Z" fill="var(--coral)" stroke="var(--coral)"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 6.5H4.5C4.5 13.5 6 12 6 8Z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/></>,
    message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    layout: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    package: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    x: <path d="M5 5l14 14M19 5 5 19"/>,
    mappin: <><path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    sliders: <><path d="M4 6h10M18 6h2M4 18h2M10 18h10M4 12h6M14 12h6"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>,
    boxopen: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 22V13"/></>,
    chevdown: <path d="M6 9l6 6 6-6"/>,
    chevleft: <path d="M15 6l-6 6 6 6"/>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4"/></>,
    flag: <><path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/></>,
    shield: <><path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></>,
    edit: <path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>,
    check: <path d="M5 12l5 5 9-9"/>,
    loader: <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>,
    star: <path d="M12 2.5l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17l-5.7 3.1 1.1-6.4L2.8 9.2l6.4-.9L12 2.5Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    home: <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>,
    gift: <><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11"/><path d="M12 9C9 9 8 6.5 9.5 5S12 5 12 9ZM12 9c3 0 4-2.5 2.5-4S12 5 12 9Z"/></>,
    swap: <path d="M7 7h11l-3-3M17 17H6l3 3"/>,
    award: <><circle cx="12" cy="8" r="5"/><path d="M8.5 13 7 21l5-2.5L17 21l-1.5-8"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    send: <><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></>,
    checkdouble: <><path d="M1.5 13l4 4L14 8"/><path d="M8 13l4 4L21.5 7.5"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  };
  return (
    <svg className={c} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {p[n] || p.star}
    </svg>
  );
};

