/**
 * MetricCard - 指标卡片组件
 * 用于展示关键指标如价格、速度、上下文窗口等
 *
 * @param {string} title - 指标标题
 * @param {array} items - 指标项 [{ provider, value, unit, color, icon }]
 * @param {string} type - 类型：'bar' | 'number' | 'badge'
 */
export default function MetricCard({ title, items = [], type = 'number', showComparison = false }) {
  const getMaxValue = () => {
    if (type !== 'bar') return null
    return Math.max(...items.map(item => parseFloat(item.value) || 0))
  }

  const getPercentage = (value) => {
    const max = getMaxValue()
    if (!max) return 0
    return (parseFloat(value) / max) * 100
  }

  return (
    <div className="metric-card">
      <h4 className="metric-card-title">{title}</h4>

      <div className={`metric-card-content ${type}`}>
        {type === 'bar' && (
          <div className="metric-bars">
            {items.map((item, idx) => (
              <div key={idx} className="metric-bar-item">
                <div className="metric-bar-header">
                  {item.icon && <span className="metric-icon">{item.icon}</span>}
                  <span className="metric-provider">{item.provider || item.label}</span>
                  <span className="metric-value">
                    {item.description || item.value}{item.unit && <span className="metric-unit">{item.unit}</span>}
                  </span>
                </div>
                <div className="metric-bar-track">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${getPercentage(item.value)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'number' && (
          <div className="metric-numbers">
            {items.map((item, idx) => (
              <div key={idx} className="metric-number-item">
                {item.icon && <div className="metric-icon">{item.icon}</div>}
                <div className="metric-number-content">
                  <div className="metric-provider">{item.provider}</div>
                  <div className="metric-value-large" style={{ color: item.color }}>
                    {item.value}
                    {item.unit && <span className="metric-unit">{item.unit}</span>}
                  </div>
                  {item.note && <div className="metric-note">{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'badge' && (
          <div className="metric-badges">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="metric-badge"
                style={{ borderColor: item.color, color: item.color }}
              >
                {item.icon && <span className="metric-icon">{item.icon}</span>}
                <div className="metric-badge-content">
                  <div className="metric-provider">{item.provider}</div>
                  <div className="metric-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
