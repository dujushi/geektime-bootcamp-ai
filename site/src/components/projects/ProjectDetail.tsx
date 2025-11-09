import { motion } from 'framer-motion';
import { Star, Clock, Code } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';
import ExpandableSection from '../ui/ExpandableSection';
import type { ProjectData } from '../../data/projects';

interface ProjectDetailProps {
  project: ProjectData;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-accent font-semibold mb-4">
          实战项目 {project.number}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {project.title}
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          {project.subtitle}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">难度:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < project.difficulty
                      ? 'fill-accent text-accent'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-text-secondary" />
            <span>{project.estimatedHours} 小时</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">所属周次:</span>
            <a
              href={`/curriculum/week-${project.weekNumber}`}
              className="text-accent hover:underline"
            >
              第 {project.weekNumber} 周
            </a>
          </div>
        </div>
      </motion.div>

      {/* Objectives */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">项目目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.objectives.map((objective, index) => (
              <div key={index} className="flex gap-3 p-4 bg-bg-secondary rounded-xl">
                <span className="text-accent text-xl font-bold">
                  {index + 1}
                </span>
                <p className="text-text-primary flex-1">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Tech Stack */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">技术栈</h2>
          <div className="flex flex-wrap gap-3">
            {project.techStack.map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-full"
              >
                <Code size={16} className="text-accent" />
                <span className="font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Architecture */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">技术架构</h2>
          <AnimatedDiagram code={project.architecture} client:load />
        </div>
      </ScrollReveal>

      {/* Implementation Steps */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">实现步骤</h2>
          <div className="space-y-4">
            {project.implementationSteps.map((step, index) => (
              <ExpandableSection
                key={index}
                title={`步骤 ${step.stepNumber}: ${step.title}`}
                defaultOpen={index === 0}
                client:load
              >
                <p className="text-text-secondary mb-4">{step.description}</p>
                {step.codeExample && (
                  <pre className="bg-bg-secondary p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{step.codeExample}</code>
                  </pre>
                )}
              </ExpandableSection>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Learning Points */}
      <ScrollReveal>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-primary mb-8">学习要点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.learningPoints.map((point, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-success text-2xl">✓</span>
                <p className="text-text-primary flex-1">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <div className="bg-gradient-to-r from-accent to-accent-purple rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始这个项目了吗？</h2>
          <p className="text-lg mb-6 opacity-90">
            在第 {project.weekNumber} 周的课程中，跟随教程一步步完成这个项目
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`/curriculum/week-${project.weekNumber}`}
              className="btn-secondary"
            >
              前往第 {project.weekNumber} 周
            </a>
            <a href="/projects" className="px-6 py-3 bg-white text-accent rounded-full font-medium hover:bg-opacity-90 transition-all">
              查看所有项目
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
