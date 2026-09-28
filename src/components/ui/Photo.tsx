import { motion, useReducedMotion } from 'framer-motion';

type PhotoProps = {
  name: 'dental-interior' | 'eter-still-life' | 'studio-interior' | 'eter-clinic';
  alt: string;
  className?: string;
  sizes?: string;
};

export default function Photo({
  name,
  alt,
  className,
  sizes = '(max-width: 550px) 100vw, 60vw',
}: PhotoProps) {
  const reduced = useReducedMotion();
  const srcSet =
    name === 'eter-clinic'
      ? '/images/eter-clinic-640.webp 640w, /images/eter-clinic.webp 1200w, /images/eter-clinic-1536.webp 1536w'
      : `/images/${name}-640.webp 640w, /images/${name}.webp 1200w, /images/${name}-2400.webp 2400w`;
  return (
    <motion.img
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      src={`/images/${name}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`animated-photo ${className || ''}`}
      width={1200}
      height={800}
      loading="lazy"
      decoding="async"
    />
  );
}
