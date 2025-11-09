import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';
import ExpandableSection from '../ui/ExpandableSection';
import type { ToolData } from '../../data/tools';

interface ToolDetailProps {
  tool: ToolData;
}

export default function ToolDetail({ tool }: ToolDetailProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-accent to-accent-purple rounded-3xl flex items-center justify-center shadow-xl">
          <span className="text-6xl font-bold text-white">{tool.name[0]}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {tool.name}
        </h1>
        <p className="text-2xl text-accent mb-6">{tool.tagline}</p>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          {tool.description}
        </p>
        <div className="mt-8">
          <a
            href={tool.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            访问官网 →
          </a>
        </div>
      </motion.div>

      {/* Features */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-bg-secondary rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-4xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Architecture */}
      {tool.architecture && (
        <ScrollReveal>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-primary mb-8">技术架构</h2>
            <AnimatedDiagram code={tool.architecture} client:load />
          </div>
        </ScrollReveal>
      )}

      {/* Usage in Course */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">
            在课程中的应用
          </h2>
          <div className="space-y-4">
            {tool.usageInCourse.map((usage, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-accent text-white rounded-full font-bold text-xl">
                  W{usage.weekNumber}
                </div>
                <div className="flex-1">
                  <a
                    href={`/curriculum/week-${usage.weekNumber}`}
                    className="text-lg font-semibold text-primary hover:text-accent transition-colors"
                  >
                    第 {usage.weekNumber} 周
                  </a>
                  <p className="text-text-secondary">{usage.role}</p>
                </div>
                <a
                  href={`/curriculum/week-${usage.weekNumber}`}
                  className="text-accent hover:underline"
                >
                  查看详情 →
                </a>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Related Resources */}
      <ScrollReveal>
        <div className="bg-gradient-to-r from-accent to-accent-purple rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-lg mb-6 opacity-90">
            在课程中深入学习 {tool.name}，掌握最前沿的 AI 辅助编程技能
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/curriculum" className="btn-secondary">
              查看课程大纲
            </a>
            <a
              href={tool.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-accent rounded-full font-medium hover:bg-opacity-90 transition-all"
            >
              访问 {tool.name} 官网
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
