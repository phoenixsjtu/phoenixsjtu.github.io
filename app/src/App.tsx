import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import ResearchFramework from './components/ResearchFramework'
import { Arrow, GithubIcon } from './components/Icons'
import './App.css'

const RefinedSceneBackground = lazy(() => import('./components/RefinedSceneBackground'))
type Lang = 'en' | 'zh'
const profile = 'https://github.com/phoenixsjtu'
const scholar = 'https://scholar.google.com/citations?user=-mW9Ny0AAAAJ'
const copy = {
  en: {
    skip: 'Skip to content', nav: ['Work', 'Experience'], github: 'GitHub profile',
    role: 'Research Engineer', headline: 'Physics, data, and intelligent equipment.',
    intro: 'At AMEC, I research digital twins and AI for semiconductor equipment.',
    scholar: 'Google Scholar', viewWork: 'View work',
    pause: 'Pause background motion', resume: 'Resume background motion',
    experience: 'Experience', experienceNote: 'Research across industry and academia.',
    careers: [
      { org: 'AMEC', full: 'Advanced Micro-Fabrication Equipment Inc. China', date: '2026 — Present', role: 'Intelligent semiconductor equipment', logo: 'amec.png' },
      { org: 'Huawei', full: 'Huawei Central Research Institute', date: '2024 — 2026', role: 'Equipment predictive maintenance algorithms', logo: 'huawei.svg' },
      { org: 'SJTU', full: 'Shanghai Jiao Tong University', date: 'March 2024', role: 'Ph.D.', logo: 'sjtu.png' },
    ],
    footer: 'Research, engineering, and open source.', top: 'Back to top',
  },
  zh: {
    skip: '跳至正文', nav: ['研究作品', '个人履历'], github: 'GitHub 主页',
    role: '研究工程师', headline: '物理机理、数据与设备智能。',
    intro: '现于中微，面向半导体设备开展数字孪生与人工智能研究。',
    scholar: '谷歌学术', viewWork: '查看作品',
    pause: '暂停背景动画', resume: '播放背景动画',
    experience: '个人履历', experienceNote: '从学术研究到工业设备智能化。',
    careers: [
      { org: 'AMEC', full: '中微半导体设备（上海）股份有限公司', date: '2026 — 至今', role: '半导体设备智能化研究', logo: 'amec.png' },
      { org: 'Huawei', full: '华为中央技术研究院', date: '2024 — 2026', role: '设备预测性维护算法研究', logo: 'huawei.svg' },
      { org: 'SJTU', full: '上海交通大学', date: '2024 年 3 月', role: '博士毕业', logo: 'sjtu.png' },
    ],
    footer: '研究、工程与开源。', top: '回到顶部',
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
  const background = new URLSearchParams(window.location.search).get('background') === 'water' ? 'water' : 'fire'
  const t = copy[lang]
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = lang === 'en' ? 'Yafei Deng — Research & Engineering' : 'Yafei Deng — 研究与工程'
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro)
    try { localStorage.setItem('phoenix-language', lang) } catch { /* Storage can be disabled. */ }
    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.history.replaceState(null, '', url)
  }, [lang, t.intro])

  return <MotionConfig reducedMotion="user"><div className={`site lang-${lang}`} id="top">
    <Suspense fallback={<div className="ambient-loading" aria-hidden="true" />}><RefinedSceneBackground kind={background} paused={paused} /></Suspense>
    <a href="#main" className="skip-link">{t.skip}</a>
    <header className="site-header"><nav className="navigation section-shell" aria-label={lang === 'en' ? 'Main navigation' : '主导航'}>
      <a className="wordmark" href="#top">YD<span className="wordmark-dot" aria-hidden="true">.</span><span className="sr-only">Yafei Deng</span></a>
      <div className="nav-links">{['research', 'experience'].map((id, i) => <a key={id} href={`#${id}`}>{t.nav[i]}</a>)}</div>
      <div className="nav-actions"><div className="language-switch" role="group" aria-label={lang === 'en' ? 'Language' : '语言'}><button onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang="en">EN</button><button onClick={() => setLang('zh')} aria-pressed={lang === 'zh'} lang="zh-CN">中</button></div><a className="nav-github" href={profile} target="_blank" rel="noreferrer" aria-label={t.github}><GithubIcon /></a></div>
    </nav></header>
    <main id="main" className="section-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-identity"><p>{t.role}</p><h1 id="hero-title">Yafei Deng<span aria-hidden="true">.</span></h1></div>
          <p className="hero-headline">{t.headline}</p>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-links"><a href="#research">{t.viewWork}<Arrow /></a><a href={scholar} target="_blank" rel="noreferrer">{t.scholar}<Arrow diagonal /></a></div>
        </div>
        <div className="hero-bottom"><button className="motion-toggle" type="button" onClick={() => setMotionOverride(!paused)} aria-label={paused ? t.resume : t.pause} aria-pressed={!paused} title={paused ? t.resume : t.pause}><span className="motion-state" aria-hidden="true" /><span className="motion-label">{lang === 'en' ? 'Motion' : '背景'}</span><svg viewBox="0 0 16 16" aria-hidden="true">{paused ? <path d="m5 3 7 5-7 5Z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" />}</svg></button></div>
      </section>
      <ResearchFramework lang={lang} />
      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="section-heading"><h2 id="experience-title">{t.experience}</h2><p>{t.experienceNote}</p></div>
        <ol className="career-list">{t.careers.map(career => <li className="career-row" key={career.org}>
          <div className={`organization-logo organization-${career.org.toLowerCase()}`}><img src={`${import.meta.env.BASE_URL}logos/${career.logo}`} alt={career.org} width="64" height="44" /></div>
          <div className="career-identity"><h3>{career.org}</h3><p>{career.full}</p><p className="career-role">{career.role}</p></div>
          <p className="career-date">{career.date}</p>
        </li>)}</ol>
      </section>
    </main>
    <footer className="site-footer section-shell"><div><p>Yafei Deng</p><span>{t.footer}</span></div><a href="#top">{t.top}<span aria-hidden="true">↑</span></a></footer>
  </div></MotionConfig>
}
