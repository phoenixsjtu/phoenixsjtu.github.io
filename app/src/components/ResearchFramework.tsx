import { DirectionAwareTabs } from './cult/direction-aware-tabs'
import ProjectCollection from './ProjectCollection'
import './ResearchFramework.css'

type Lang = 'en' | 'zh'
const content = {
  en: {
    work: 'Predictive maintenance',
    interests: 'Research interests',
    directions: [
      { label: 'Physics + AI', methods: ['Physics-constrained learning (PINNs)', 'Physics-informed data enrichment', 'Hybrid physical–data surrogate models'] },
      { label: 'Digital twins', methods: ['Static · Design optimization', 'Semi-dynamic · Virtual process validation', 'Dynamic · Operational monitoring'] },
      { label: 'Predictive maintenance', methods: ['Anomaly detection', 'Fault diagnosis', 'Root-cause tracing'] },
    ],
  },
  zh: {
    work: '预测性维护',
    interests: '研究方向',
    directions: [
      { label: '物理＋AI', methods: ['物理约束学习（PINN）', '物理信息增强数据', '数据与机理融合的代理模型'] },
      { label: '数字孪生', methods: ['静态 · 设计优化', '半动态 · 工艺虚拟验证', '动态 · 实时运维监测'] },
      { label: '预测性维护', methods: ['异常检测', '故障诊断', '根因溯源'] },
    ],
  },
}

export default function ResearchFramework({ lang }: { lang: Lang }) {
  const t = content[lang]
  const tabs = t.directions.map(({ label, methods }, id) => ({
    id, label, content: <ul className="research-methods">{methods.map(method => <li key={method}>{method}</li>)}</ul>,
  }))

  return <>
    <section className="research-section" id="research" aria-labelledby="research-title">
      <div className="section-heading"><h2 id="research-title">{t.work}</h2></div>
      <ProjectCollection lang={lang} />
    </section>
    <section className="research-section" aria-labelledby="research-interests-title">
      <div className="section-heading"><h2 id="research-interests-title">{t.interests}</h2></div>
      <DirectionAwareTabs tabs={tabs} className="research-tablist" ariaLabel={t.interests} />
    </section>
  </>
}
