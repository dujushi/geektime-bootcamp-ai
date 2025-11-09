import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

interface TimelineItem {
  weekNumber: number;
  title: string;
  subtitle: string;
  href?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {items.map((item, index) => (
        <ScrollReveal key={item.weekNumber} delay={index * 0.1}>
          <div className="relative flex gap-6 pb-12 last:pb-0">
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="w-4 h-4 rounded-full bg-accent z-10"
              />
              {index < items.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="w-0.5 bg-gradient-to-b from-accent to-transparent absolute top-4"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 group">
              <a
                href={item.href || `/curriculum/week-${item.weekNumber}`}
                className="block p-6 rounded-xl bg-bg-secondary hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-accent">
                    第 {item.weekNumber} 周
                  </span>
                  <span className="text-xs text-text-tertiary">→</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-text-secondary">{item.subtitle}</p>
              </a>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
