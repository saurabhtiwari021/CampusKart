import { useEffect, useRef, useState } from 'react';

export function Reveal({ as: Tag = 'div', delay = 0, direction = 'up', blur = false, scale = false, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.unobserve(el); } },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const transforms = {
    up: 'translateY(32px)',
    down: 'translateY(-32px)',
    left: 'translateX(32px)',
    right: 'translateX(-32px)',
  };

  const style = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'none' : `${transforms[direction] || transforms.up}${scale ? ' scale(0.96)' : ''}`,
    filter: blur && !inView ? 'blur(8px)' : 'blur(0px)',
    transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms, filter 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    willChange: 'opacity, transform, filter',
    transitionDelay: `${delay}ms`,
  };

  return (
    <Tag ref={ref} className={`${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

export default Reveal;
