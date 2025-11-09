import { useEffect, useRef, useState, useMemo } from 'react'
import mermaid from 'mermaid'
import ImageModal from './ImageModal'

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#c47645',
    primaryTextColor: '#2d2d2d',
    primaryBorderColor: '#c47645',
    lineColor: '#c47645',
    secondaryColor: '#f5f5f0',
    tertiaryColor: '#fdf6ed',
    background: '#ffffff',
    mainBkg: '#ffffff',
    secondBkg: '#f9f7f4',
    textColor: '#2d2d2d',
    fontSize: '16px',
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "Helvetica Neue", Helvetica, Arial, sans-serif',
    nodeBorder: '#c47645',
    clusterBkg: '#fdf6ed',
    clusterBorder: '#e5e5e0',
    defaultLinkColor: '#c47645',
    titleColor: '#2d2d2d',
    edgeLabelBackground: '#f9f7f4',
    pie1: '#c47645',
    pie2: '#d9a574',
    pie3: '#8a4a2f',
    pie4: '#b86328',
    pie5: '#e5c5a0',
    pie6: '#9d6b47'
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 25,
    nodeSpacing: 80,
    rankSpacing: 80,
    diagramPadding: 25,
    useMaxWidth: true,
    defaultRenderer: 'dagre'
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 20,
    actorMargin: 50,
    width: 160,
    height: 75,
    boxMargin: 10,
    noteMargin: 10,
    messageMargin: 35,
    useMaxWidth: true
  }
})

let idCounter = 0

export default function Mermaid({ chart }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const id = useMemo(() => `mermaid-${idCounter++}`, [])

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Use mermaid.render to get SVG string
        const { svg } = await mermaid.render(id, chart)
        setSvg(svg)
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err.message || '渲染失败')
      }
    }

    if (chart) {
      renderDiagram()
    }
  }, [chart, id])

  if (error) {
    return (
      <div className="mermaid-container">
        <div style={{ padding: '1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '0.25rem', color: '#c00' }}>
          <strong>图表渲染失败</strong>
          <pre style={{ marginTop: '0.5rem', fontSize: '0.85em', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="mermaid-container">
        <div style={{ padding: '2rem', color: '#999' }}>正在加载图表...</div>
      </div>
    )
  }

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="mermaid-container">
        <button className="mermaid-zoom-button" onClick={handleClick} title="点击放大查看">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <div className="mermaid-svg-wrapper" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      <ImageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="mermaid-modal-content" dangerouslySetInnerHTML={{ __html: svg }} />
      </ImageModal>
    </>
  )
}
