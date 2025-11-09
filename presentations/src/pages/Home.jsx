import { Link } from 'react-router-dom'

function Home({ presentations }) {
  return (
    <div className="home">
      <h1>欢迎来到陈天的 AI 训练营</h1>
      <p>探索使用 AI 构建的交互式演示文稿</p>

      <div className="presentations-list">
        {presentations.map(({ path, name }) => (
          <Link to={path} key={path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="presentation-card">
              <h3>{name}</h3>
              <p>点击查看演示文稿 →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
