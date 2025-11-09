import { useState } from 'react'

/**
 * ComparisonCard - 用于展示 AI 提供商特性的美观卡片组件
 *
 * @param {string} provider - 提供商名称 (Claude, OpenAI, Google Gemini)
 * @param {string} logo - Logo emoji 或图片
 * @param {string} color - 主题色
 * @param {string} tagline - 标语
 * @param {array} features - 特性列表
 * @param {object} metrics - 关键指标
 */
export default function ComparisonCard({
  provider,
  logo,
  color = '#c47645',
  tagline,
  features = [],
  metrics = {},
  highlight = false
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`comparison-card ${highlight ? 'highlight' : ''}`}
      style={{ '--card-color': color }}
    >
      <div className="comparison-card-header">
        <div className="comparison-card-logo">{logo}</div>
        <h3 className="comparison-card-title">{provider}</h3>
        <p className="comparison-card-tagline">{tagline}</p>
      </div>

      <div className="comparison-card-metrics">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="metric-item">
            <span className="metric-label">{key}</span>
            <span className="metric-value">{value}</span>
          </div>
        ))}
      </div>

      <div className={`comparison-card-features ${isExpanded ? 'expanded' : ''}`}>
        <h4>核心特性</h4>
        <ul>
          {features.slice(0, isExpanded ? features.length : 4).map((feature, idx) => (
            <li key={idx}>
              <span className="feature-icon">✓</span>
              <span className="feature-text">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {features.length > 4 && (
        <button
          className="comparison-card-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '收起' : `查看全部 ${features.length} 项特性`}
        </button>
      )}
    </div>
  )
}
