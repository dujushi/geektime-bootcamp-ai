import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  backgroundClass?: string;
}

export default function Hero({
  title,
  subtitle,
  children,
  backgroundClass = 'bg-gradient-to-b from-bg-primary to-bg-secondary',
}: HeroProps) {
  return (
    <section
      className={`min-h-screen flex items-center justify-center ${backgroundClass}`}
    >
      <div className="container-custom text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-primary mb-6"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-text-secondary mb-8 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
