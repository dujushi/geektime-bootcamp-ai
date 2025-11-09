import { useState } from 'react'

/**
 * TabComparison - 标签式对比视图
 *
 * @param {array} tabs - 标签列表 [{ id, label, content, icon }]
 * @param {string} defaultTab - 默认激活的标签
 */
export default function TabComparison({ tabs = [], defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeContent = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="tab-comparison">
      <div className="tab-comparison-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-comparison-content">
        {activeContent?.content}
      </div>
    </div>
  )
}
