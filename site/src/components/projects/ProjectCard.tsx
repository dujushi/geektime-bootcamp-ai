import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

interface ProjectCardProps {
  number: number;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  techStack: string[];
  href?: string;
  previewImage?: string;
}

export default function ProjectCard({
  number,
  title,
  subtitle,
  difficulty,
  estimatedHours,
  techStack,
  href,
  previewImage,
}: ProjectCardProps) {
  return (
    <motion.a
      href={href || `/projects/project-${number}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Preview Image */}
      <div className="relative aspect-video bg-gradient-to-br from-accent to-accent-purple overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white opacity-30">
              {number}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold">
          项目 {number}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary mb-4">{subtitle}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
          <div className="flex items-center gap-1">
            <span>难度:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < difficulty ? 'fill-accent text-accent' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <div>{estimatedHours} 小时</div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-bg-secondary text-xs font-medium rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
          <span>查看详情</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.a>
  );
}
