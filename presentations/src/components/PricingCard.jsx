import { useState } from 'react'

/**
 * PricingCard - 价格对比卡片组件
 *
 * @param {object} pricing - 价格信息
 * @param {string} provider - 提供商
 * @param {string} color - 主题色
 */
export default function PricingCard({
  provider,
  color = '#c47645',
  pricing = {},
  popular = false,
  icon = '🤖'
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`pricing-card ${popular ? 'popular' : ''}`}
      style={{ '--pricing-color': color }}
    >
      {popular && <div className="pricing-badge">最受欢迎</div>}

      <div className="pricing-card-header">
        <div className="pricing-icon">{icon}</div>
        <h3 className="pricing-provider">{provider}</h3>
      </div>

      <div className="pricing-card-price">
        <div className="pricing-models">
          {pricing.input && (
            <div className="pricing-model">
              <div className="pricing-label">输入价格</div>
              <div className="pricing-amount">
                <span className="pricing-currency">$</span>
                <span className="pricing-value">{pricing.input}</span>
                <span className="pricing-unit">/M tokens</span>
              </div>
            </div>
          )}

          {pricing.output && (
            <div className="pricing-model">
              <div className="pricing-label">输出价格</div>
              <div className="pricing-amount">
                <span className="pricing-currency">$</span>
                <span className="pricing-value">{pricing.output}</span>
                <span className="pricing-unit">/M tokens</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {pricing.features && (
        <div className={`pricing-features ${isExpanded ? 'expanded' : ''}`}>
          <ul>
            {pricing.features.slice(0, isExpanded ? pricing.features.length : 3).map((feature, idx) => (
              <li key={idx}>
                <span className="feature-check">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          {pricing.features.length > 3 && (
            <button
              className="pricing-expand"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '收起' : `查看更多 (${pricing.features.length - 3})`}
            </button>
          )}
        </div>
      )}

      {pricing.limits && (
        <div className="pricing-limits">
          <h5>使用限制</h5>
          {Object.entries(pricing.limits).map(([key, value]) => (
            <div key={key} className="pricing-limit-item">
              <span className="limit-label">{key}:</span>
              <span className="limit-value">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
