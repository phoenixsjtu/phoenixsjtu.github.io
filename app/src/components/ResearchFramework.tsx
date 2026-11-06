import { DirectionAwareTabs } from './cult/direction-aware-tabs'
import ProjectCollection from './ProjectCollection'
import './ResearchFramework.css'

type Lang = 'en' | 'zh'
const content = {
  en: {
    title: 'Research & projects', tabsLabel: 'Research areas',
    directions: [
      { tab: 'Physics + AI', title: 'Semiconductor physics + AI', methods: ['Physics-constrained learning · PINNs', 'Physics-informed data enrichment', 'Hybrid physical–data surrogate models'], pending: 'Semiconductor physics + AI projects will be added here.' },
      { tab: 'Digital twins', title: 'Digital twins', methods: ['Static · Design optimization', 'Semi-dynamic · Virtual process validation', 'Dynamic · Real-time operational monitoring'], pending: 'Digital twin projects will be added here.' },
      { tab: 'Predictive maintenance', title: 'Predictive maintenance', methods: ['Anomaly detection', 'Fault diagnosis', 'Root-cause tracing'], pending: '' },
    ],
    coming: 'Projects forthcoming', projects: 'Open-source projects', source: 'Earlier work on',
  },
  zh: {
    title: '研究与项目', tabsLabel: '研究方向',
    directions: [
      { tab: '物理＋AI', title: '半导体物理＋AI', methods: ['物理约束学习 · PINN', '物理信息增强数据', '数据与机理融合代理模型'], pending: '后续将在这里更新半导体物理＋AI项目。' },
      { tab: '数字孪生', title: '数字孪生', methods: ['静态 · 设计优化', '半动态 · 工艺虚拟验证', '动态 · 实时运维监测'], pending: '后续将在这里更新数字孪生项目。' },
      { tab: '预测性维护', title: '预测性维护', methods: ['异常检测', '故障诊断', '根因溯源'], pending: '' },
    ],
    coming: '项目待更新', projects: '开源项目', source: '早期工作发布于',
  },
}

export default function ResearchFramework({ lang }: { lang: Lang }) {
  const t = content[lang]
  const tabs = t.directions.map((direction, index) => ({
    id: index, label: direction.tab, content: <div className="research-panel">
      <h3 className="research-area-title">{direction.title}</h3>
      <ul className="research-methods">{direction.methods.map(method => <li key={method}>{method}</li>)}</ul>
      {index === 2 ? <>
        <div className="project-section-meta"><p>{t.projects}</p><p>{t.source} <a href="https://github.com/phoenixdyf" target="_blank" rel="noreferrer">@phoenixdyf</a></p></div>
        <ProjectCollection lang={lang} />
      </> : <div className="research-coming"><p>{t.coming}</p><span>{direction.pending}</span></div>}
    </div>,
  }))
  return <section className="research-section" id="research" aria-labelledby="research-title"><div className="section-shell">
    <h2 id="research-title">{t.title}</h2>
    <DirectionAwareTabs tabs={tabs} defaultTabId={2} className="research-tablist" ariaLabel={t.tabsLabel} />
  </div></section>
}
