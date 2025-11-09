import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="text-center p-8 rounded-xl bg-bg-secondary hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="text-5xl mb-4">
        {typeof icon === 'string' ? icon : icon}
      </div>
      <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </motion.div>
  );
}
