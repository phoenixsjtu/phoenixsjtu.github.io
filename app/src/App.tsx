import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import ResearchFramework from './components/ResearchFramework'
import { Arrow, GithubIcon } from './components/Icons'
import './App.css'

const EngineeringScene = lazy(() => import('./components/EngineeringScene'))
type Lang = 'en' | 'zh'
const profile = 'https://github.com/phoenixsjtu'
const scholar = 'https://scholar.google.com/citations?user=-mW9Ny0AAAAJ'
const copy = {
  en: {
    skip: 'Skip to content', nav: ['Research & projects', 'Experience'], github: 'GitHub profile',
    role: 'Yafei Deng · Research Engineer', title: <>Physics + AI.<br />Intelligent equipment.</>, intro: 'Research at AMEC in digital twins and predictive maintenance for semiconductor equipment.',
    projects: 'View projects', scholar: 'Google Scholar', current: 'Current account', previous: 'Earlier work',
    pause: 'Pause background motion', resume: 'Resume background motion',
    experience: 'Experience',
    careers: [
      { org: 'AMEC', full: 'Advanced Micro-Fabrication Equipment Inc. China', date: '2026 — Present', role: 'Intelligent semiconductor equipment', logo: 'amec.png' },
      { org: 'Huawei', full: 'Huawei Central Research Institute', date: '2024 — 2026', role: 'Predictive maintenance algorithm research', logo: 'huawei.svg' },
      { org: 'SJTU', full: 'Shanghai Jiao Tong University', date: 'March 2024', role: 'Ph.D.', logo: 'sjtu.png' },
    ],
    top: 'Back to top',
  },
  zh: {
    skip: '跳至正文', nav: ['研究与项目', '个人履历'], github: 'GitHub 主页',
    role: 'Yafei Deng · 研究工程师', title: <>物理＋AI，<br />面向设备智能化。</>, intro: '现于中微，面向半导体设备开展数字孪生与预测性维护研究。',
    projects: '查看项目', scholar: '谷歌学术', current: '当前账号', previous: '早期工作',
    pause: '暂停背景动画', resume: '播放背景动画',
    experience: '个人履历',
    careers: [
      { org: 'AMEC', full: '中微半导体设备（上海）股份有限公司', date: '2026 — 至今', role: '半导体设备智能化研究', logo: 'amec.png' },
      { org: 'Huawei', full: '华为中央技术研究院', date: '2024 — 2026', role: '设备预测性维护算法研究', logo: 'huawei.svg' },
      { org: 'SJTU', full: '上海交通大学', date: '2024 年 3 月', role: '博士毕业', logo: 'sjtu.png' },
    ],
    top: '回到顶部',
  },
}

function initialLanguage(): Lang {
  const query = new URLSearchParams(window.location.search).get('lang')
  if (query === 'en' || query === 'zh') return query
  try { return localStorage.getItem('phoenix-language') === 'zh' ? 'zh' : 'en' } catch { return 'en' }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLanguage)
  const reducedMotion = useReducedMotion()
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null)
  const paused = motionOverride ?? Boolean(reducedMotion)
  const t = copy[lang]
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = lang === 'en' ? 'Yafei Deng — Research & Projects' : 'Yafei Deng — 研究与项目'
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro)
    try { localStorage.setItem('phoenix-language', lang) } catch { /* Storage can be disabled. */ }
    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.history.replaceState(null, '', url)
  }, [lang, t.intro])

  return <MotionConfig reducedMotion="user"><div className={`site lang-${lang}`} id="top">
    <a href="#main" className="skip-link">{t.skip}</a>
    <header className="site-header"><nav className="navigation section-shell" aria-label={lang === 'en' ? 'Main navigation' : '主导航'}>
      <a className="wordmark" href="#top"><span className="brand-mark" aria-hidden="true">y.</span>Yafei Deng</a>
      <div className="nav-links">{['research', 'experience'].map((id, i) => <a key={id} href={`#${id}`}>{t.nav[i]}</a>)}</div>
      <div className="nav-actions"><div className="language-switch" role="group" aria-label={lang === 'en' ? 'Language' : '语言'}><button onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang="en">EN</button><button onClick={() => setLang('zh')} aria-pressed={lang === 'zh'} lang="zh-CN">中</button></div><a className="nav-github" href={profile} target="_blank" rel="noreferrer" aria-label={t.github}><GithubIcon /><span>GitHub</span></a></div>
    </nav></header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <Suspense fallback={<div className="engineering-background engineering-background-fallback" aria-hidden="true" />}><EngineeringScene paused={paused} /></Suspense>
        <div className="hero-inner section-shell">
          <div className="hero-copy">
            <p className="hero-role">{t.role}</p>
            <h1 id="hero-title">{t.title}</h1>
            <p className="hero-intro">{t.intro}</p>
            <div className="hero-actions"><a className="button button-primary" href="#research">{t.projects}<Arrow /></a><a className="button button-secondary" href={scholar} target="_blank" rel="noreferrer">{t.scholar}<Arrow diagonal /></a></div>
          </div>
          <div className="hero-bottom">
            <div className="account-note"><span>{t.current} <a href={profile} target="_blank" rel="noreferrer">@phoenixsjtu</a></span><span>{t.previous} <a href="https://github.com/phoenixdyf" target="_blank" rel="noreferrer">@phoenixdyf</a></span></div>
            <button className="motion-toggle" type="button" onClick={() => setMotionOverride(!paused)} aria-label={paused ? t.resume : t.pause} aria-pressed={!paused}>
              <svg viewBox="0 0 16 16" aria-hidden="true">{paused ? <path d="m5 3 7 5-7 5Z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" />}</svg>
            </button>
          </div>
        </div>
      </section>
      <ResearchFramework lang={lang} />
      <section className="experience-section section-shell" id="experience" aria-labelledby="experience-title">
        <h2 id="experience-title">{t.experience}</h2>
        <ol className="career-list">{t.careers.map((career) => <li className="career-row" key={career.org}>
          <div className="organization-logo"><img src={`${import.meta.env.BASE_URL}logos/${career.logo}`} alt={career.org} /></div>
          <div className="career-identity"><h3>{career.org}</h3><p>{career.full}</p></div>
          <p className="career-role">{career.role}</p><p className="career-date">{career.date}</p>
        </li>)}</ol>
      </section>
    </main>
    <footer className="site-footer"><div className="footer-inner section-shell"><span>Yafei Deng</span><div><a href={profile} target="_blank" rel="noreferrer">GitHub<Arrow diagonal /></a><a href={scholar} target="_blank" rel="noreferrer">{t.scholar}<Arrow diagonal /></a><a href="#top">{t.top}<span aria-hidden="true">↑</span></a></div></div></footer>
  </div></MotionConfig>
}
