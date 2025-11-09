import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import Home from './pages/Home'
import NotebookLM from './presentations/NotebookLM.mdx'
import AIComparison from './presentations/AI-Comparison.mdx'
import AICodingToolsComparison from './presentations/AI-Coding-Tools-Comparison.mdx'
import ClaudeCodeSetup from './presentations/Claude-Code-Setup.mdx'
import ClaudeCodeAnalysis from './presentations/claude-code.mdx'
import Mermaid from './components/Mermaid'

// MDX components
const components = {
  pre: ({ children }) => {
    // Check if this is a code block
    if (children?.props) {
      const { className, children: code } = children.props

      // Check if it's a mermaid code block
      if (className === 'language-mermaid') {
        return <Mermaid chart={code} />
      }
    }

    // Regular code block
    return <pre>{children}</pre>
  }
}

const presentations = [
  { path: '/claude-code-analysis', name: 'Claude Code 深度架构分析', component: ClaudeCodeAnalysis },
  { path: '/claude-code-setup', name: 'Claude Code 安装使用指南', component: ClaudeCodeSetup },
  { path: '/ai-coding-tools', name: 'AI 代码助手对比', component: AICodingToolsComparison },
  { path: '/ai-comparison', name: 'AI 大语言模型对比', component: AIComparison },
  { path: '/notebooklm', name: 'NotebookLM 深度解析', component: NotebookLM }
]

function Sidebar() {
  const location = useLocation()

  return (
    <div className="sidebar">
      <h1>陈天的 AI 训练营</h1>
      <nav>
        <ul>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              首页
            </Link>
          </li>
          {presentations.map(({ path, name }) => (
            <li key={path}>
              <Link to={path} className={location.pathname === path ? 'active' : ''}>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function App() {
  return (
    <MDXProvider components={components}>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home presentations={presentations} />} />
              {presentations.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <div className="mdx-content">
                      <Component />
                    </div>
                  }
                />
              ))}
            </Routes>
          </div>
        </div>
      </Router>
    </MDXProvider>
  )
}

export default App
