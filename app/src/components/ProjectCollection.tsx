import { type ReactNode } from 'react'
import { Arrow } from './Icons'
import {
  MorphingDialog, MorphingDialogTrigger, MorphingDialogContainer,
  MorphingDialogContent, MorphingDialogImage, MorphingDialogTitle, MorphingDialogClose,
} from './motion-primitives/morphing-dialog'
import './ProjectCollection.css'

type Lang = 'en' | 'zh'
const github = 'https://github.com/phoenixsjtu'
const paper = 'https://doi.org/10.1016/j.neucom.2023.126391'
const app = 'https://phoenixsjtu.github.io/PHM-Workbench/'
const authors = 'Yafei Deng, Jun Lv, Delin Huang, Shichang Du'
const paperTitle = 'Combining the theoretical bound and deep adversarial network for machinery open-set diagnosis transfer'
const copy = {
  en: {
    phases: ['Papers', 'Datasets', 'Algorithm code', 'Interface tools'],
    paper: 'Theory-guided transfer learning',
    paperDescription: 'Open-set machinery fault diagnosis across operating conditions.',
    paperAlt: 'First page of the TPTLN paper in Neurocomputing',
    readPaper: 'Read paper', viewCover: 'View paper first page', close: 'Close preview',
    dataset: 'Rotating Machinery PHM Datasets',
    datasetDescription: '38 dataset entries for diagnosis, monitoring, and remaining useful life estimation.',
    browse: 'Browse datasets',
    code: ['TPTLN implementation', 'CWRU transfer learning experiments', 'Mechanical vibration feature reference'],
    toolDescription: 'Explore a rotating-machinery workflow and edit a diagnosis blueprint with demo data.',
    preview: 'Open live demo', source: 'Source code',
  },
  zh: {
    phases: ['论文', '数据集', '算法代码', '界面工具'],
    paper: '理论引导的渐进迁移学习',
    paperDescription: '面向跨工况的机械开放集故障诊断。',
    paperAlt: 'TPTLN 论文在 Neurocomputing 发表的首页',
    readPaper: '阅读论文', viewCover: '查看论文首页', close: '关闭预览',
    dataset: '旋转机械 PHM 数据集',
    datasetDescription: '38 条索引，覆盖故障诊断、状态监测和剩余寿命预测。',
    browse: '浏览数据集',
    code: ['TPTLN 算法实现', 'CWRU 轴承迁移学习实验', '机械振动特征参考'],
    toolDescription: '用示例数据查看旋转机械诊断流程，试用可编辑的蓝图画布。',
    preview: '打开在线演示', source: '源代码',
  },
}
const codeRepos = [
  'Theory-guided-Progressive-Transfer-Learning-Network',
  'Transfer-Learning-for-CWRU-dataset',
  'Feature-Introduction-for-Mechanical-Vibration-Analysis',
]

function ExternalLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return <a className={primary ? 'work-link work-link-primary' : 'work-link'} href={href} target="_blank" rel="noreferrer">
    {children}<Arrow diagonal />
  </a>
}

function PaperCover({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const image = `${import.meta.env.BASE_URL}projects/tptln-paper.png`
  return <MorphingDialog transition={{ type: 'spring', duration: .36, bounce: 0 }}>
    <MorphingDialogTrigger className="paper-cover" aria-label={t.viewCover}>
      <MorphingDialogImage src={image} alt={t.paperAlt} width={953} height={1270} loading="lazy" decoding="async" />
    </MorphingDialogTrigger>
    <MorphingDialogContainer>
      <MorphingDialogContent className="paper-dialog">
        <MorphingDialogClose aria-label={t.close} />
        <div className="paper-dialog-art">
          <MorphingDialogImage src={image} alt={t.paperAlt} width={953} height={1270} />
        </div>
        <div className="paper-dialog-copy">
          <MorphingDialogTitle><h2>{paperTitle}</h2></MorphingDialogTitle>
          <p>{authors}</p>
          <p>Neurocomputing 548 (2023), 126391</p>
          <ExternalLink href={paper}>{t.readPaper}</ExternalLink>
        </div>
      </MorphingDialogContent>
    </MorphingDialogContainer>
  </MorphingDialog>
}

export default function ProjectCollection({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const phases = [
    <div className="work-paper">
      <div>
        <h4>{t.paper}</h4>
        <p>{t.paperDescription}</p>
        <p className="work-meta">Neurocomputing · 2023</p>
        <ExternalLink href={paper}>{t.readPaper}</ExternalLink>
      </div>
      <PaperCover lang={lang} />
    </div>,
    <div>
      <h4>{t.dataset}</h4>
      <p>{t.datasetDescription}</p>
      <ExternalLink href={`${github}/Rotating-Machinery-PHM-Datasets`}>{t.browse}</ExternalLink>
    </div>,
    <ul className="work-code-list">{codeRepos.map((repo, index) => <li key={repo}>
      <ExternalLink href={`${github}/${repo}`}>{t.code[index]}</ExternalLink>
    </li>)}</ul>,
    <div>
      <h4>PHM Workbench</h4>
      <p>{t.toolDescription}</p>
      <div className="work-actions">
        <ExternalLink href={app} primary>{t.preview}</ExternalLink>
        <ExternalLink href={`${github}/PHM-Workbench`}>{t.source}</ExternalLink>
      </div>
    </div>,
  ]

  return <ol className="work-stages" id="work">
    {phases.map((phase, index) => <li className="work-stage" key={t.phases[index]}>
      <h3><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{t.phases[index]}</h3>
      <div className="work-stage-content">{phase}</div>
    </li>)}
  </ol>
}
