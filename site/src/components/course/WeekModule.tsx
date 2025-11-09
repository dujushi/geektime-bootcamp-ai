import { useState } from 'react';
import { motion } from 'framer-motion';
import ExpandableSection from '../ui/ExpandableSection';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';

interface WeekModuleProps {
  weekNumber: number;
  title: string;
  subtitle: string;
  objectives: string[];
  keyPoints: { title: string; description: string; diagram?: string }[];
  practicalContent: string[];
  relatedTools: string[];
  estimatedHours: number;
}

export default function WeekModule({
  weekNumber,
  title,
  subtitle,
  objectives,
  keyPoints,
  practicalContent,
  relatedTools,
  estimatedHours,
}: WeekModuleProps) {
  const [activeTab, setActiveTab] = useState<'objectives' | 'keyPoints' | 'practice'>(
    'objectives'
  );

  const tabs = [
    { id: 'objectives' as const, label: '学习目标' },
    { id: 'keyPoints' as const, label: '知识点' },
    { id: 'practice' as const, label: '实践内容' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent-purple p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            第 {weekNumber} 周
          </span>
          <span className="text-sm opacity-90">{estimatedHours} 小时</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg opacity-90">{subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-8">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'objectives' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {objectives.map((objective, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-text-primary flex-1">{objective}</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'keyPoints' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {keyPoints.map((point, index) => (
              <ExpandableSection key={index} title={point.title}>
                <p className="text-text-secondary mb-4">{point.description}</p>
                {point.diagram && <AnimatedDiagram code={point.diagram} />}
              </ExpandableSection>
            ))}
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {practicalContent.map((content, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-accent font-bold">{index + 1}.</span>
                <p className="text-text-primary flex-1">{content}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="px-8 pb-8">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">相关工具</h3>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <a
                key={tool}
                href={`/tools/${tool}`}
                className="px-4 py-2 bg-bg-secondary hover:bg-accent hover:text-white rounded-full text-sm font-medium transition-colors"
              >
                {tool}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
