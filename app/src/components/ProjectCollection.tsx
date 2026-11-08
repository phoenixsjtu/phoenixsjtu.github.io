import { TextureCard } from './cult/texture-card'
import { Arrow, GithubIcon } from './Icons'
import {
  MorphingDialog, MorphingDialogTrigger, MorphingDialogContainer,
  MorphingDialogContent, MorphingDialogImage, MorphingDialogTitle,
  MorphingDialogDescription, MorphingDialogClose,
} from './motion-primitives/morphing-dialog'
import './ProjectCollection.css'

type Lang = 'en' | 'zh'
type Project = {
  slug: string
  cover: { file: string; kind: 'paper' | 'readme' | 'notebook'; source: string; en: string; zh: string }
  en: { title: string; description: string; type: string; detail: string }
  zh: { title: string; description: string; type: string; detail: string }
}
const projects: Project[] = [
  {
    slug: 'Opensource_Dataset_Compilation_for_PHM',
    cover: { file: 'phm-readme.jpg', kind: 'readme', source: 'https://github.com/phoenixdyf/Opensource_Dataset_Compilation_for_PHM#readme', en: 'Typeset excerpt from the PHM dataset collection README.', zh: 'PHM 数据集汇编 README 的重排节选。' },
    en: { title: 'PHM dataset collection', description: 'Public datasets for fault diagnosis, health assessment, and remaining useful life prediction.', type: 'Dataset collection', detail: 'A reference collection spanning component, equipment, and production-line data across industrial applications.' },
    zh: { title: 'PHM 公开数据集汇编', description: '汇集故障诊断、健康评估与剩余寿命预测的公开数据集。', type: '数据集汇编', detail: '覆盖部件、设备及产线层级，为工业设备健康管理研究提供数据索引。' },
  },
  {
    slug: 'Theory-guided-Progressive-Transfer-Learning-Network',
    cover: { file: 'tptln-paper.png', kind: 'paper', source: 'https://me.sjtu.edu.cn/upload/ueditor/file/20250108/1736304766481166.pdf', en: 'Original first page of the TPTLN paper, published in Neurocomputing in 2023, with Yafei Deng as first author.', zh: 'TPTLN 论文原始首页，2023 年发表于 Neurocomputing，第一作者 Yafei Deng。' },
    en: { title: 'Theory-guided transfer learning', description: 'Progressive transfer learning for open-set machinery fault diagnosis.', type: 'Research code', detail: 'TPTLN demo code combining theoretical bounds and deep adversarial learning, with bearing and gearbox tasks.' },
    zh: { title: '理论引导的渐进迁移学习', description: '面向机械开放集故障诊断的渐进迁移学习方法。', type: '研究代码', detail: 'TPTLN 示例代码，结合理论界与深度对抗学习，包含轴承与齿轮箱诊断任务。' },
  },
  {
    slug: 'Transfer-Learning-for-CWRU-dataset',
    cover: { file: 'cwru-notebook.jpg', kind: 'notebook', source: 'https://github.com/phoenixdyf/Transfer-Learning-for-CWRU-dataset/blob/main/Adversarial-based%20Model.ipynb', en: 'Typeset excerpt from the CWRU adversarial transfer learning notebook.', zh: 'CWRU 对抗迁移学习 Notebook 的重排节选。' },
    en: { title: 'CWRU transfer learning', description: 'Transfer learning experiments for bearing fault diagnosis.', type: 'Experiments', detail: 'Feature-based, parameter-based, and adversarial transfer learning notebooks using the CWRU bearing dataset.' },
    zh: { title: 'CWRU 迁移学习实践', description: '基于 CWRU 轴承数据集的迁移学习与故障诊断实验。', type: '实验代码', detail: '包含基于特征、参数及对抗学习的迁移学习笔记，使用 CWRU 轴承数据集。' },
  },
  {
    slug: 'Feature-Introduction-for-Mechanical-Vibration-Analysis',
    cover: { file: 'vibration-readme.jpg', kind: 'readme', source: 'https://github.com/phoenixdyf/Feature-Introduction-for-Mechanical-Vibration-Analysis#readme', en: 'Typeset excerpt from the vibration feature reference, showing energy features and the RMS formula.', zh: '振动特征文档的重排节选，展示能量特征及 RMS 公式。' },
    en: { title: 'Mechanical vibration features', description: 'Feature definitions and formulas for vibration analysis.', type: 'Technical reference', detail: 'A guide to energy, impact, and other vibration features used in condition monitoring.' },
    zh: { title: '机械振动特征解析', description: '机械振动分析中的特征定义、计算公式与应用说明。', type: '技术参考', detail: '介绍能量、冲击等振动特征，为状态监测与信号分析提供参考。' },
  },
]

function ProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  const p = project[lang]
  const paper = project.cover.kind === 'paper'
  const image = `${import.meta.env.BASE_URL}projects/${project.cover.file}`
  const kind = paper ? 'Neurocomputing · 2023' : project.cover.kind === 'notebook' ? 'Jupyter Notebook' : 'GitHub README'
  const preview = lang === 'en' ? 'Preview' : '预览'
  const source = paper ? (lang === 'en' ? 'Read paper' : '阅读论文') : (lang === 'en' ? 'Read source' : '阅读文档')
  return <article className={`repository-item ${paper ? 'repository-featured' : 'repository-resource'}`} aria-labelledby={`title-${project.slug}`}>
    <MorphingDialog transition={{ type: 'spring', duration: .48, bounce: 0 }}>
      <TextureCard className="repository-card">
        <MorphingDialogTrigger className="repository-cover" aria-label={`${preview}: ${p.title}`}>
          <div className="repository-page"><MorphingDialogImage src={image} alt={project.cover[lang]} width={paper ? 953 : 1383} height={paper ? 1270 : 1255} loading="lazy" decoding="async" /></div>
          <span className="repository-preview-cue"><span>{preview}</span><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M3 7V3h4m6 0h4v4M3 13v4h4m6 0h4v-4" /></svg></span>
        </MorphingDialogTrigger>
        <div className="repository-body">
          <p className="repository-kind">{paper ? kind : p.type}</p>
          <h3 id={`title-${project.slug}`}>{p.title}</h3>
          <p className="repository-description">{p.description}</p>
          {paper && <p className="repository-authors">Yafei Deng, Jun Lv, Delin Huang, Shichang Du</p>}
          <div className="repository-actions">
            {paper && <a className="paper-link" href="https://doi.org/10.1016/j.neucom.2023.126391" target="_blank" rel="noreferrer">{source}<Arrow diagonal /></a>}
            <a href={`https://github.com/phoenixdyf/${project.slug}`} target="_blank" rel="noreferrer" aria-label={`${lang === 'en' ? 'View on GitHub' : '在 GitHub 查看'}: ${p.title}`}><GithubIcon /><span>{paper ? (lang === 'en' ? 'Code' : '代码') : 'GitHub'}</span><Arrow diagonal /></a>
          </div>
        </div>
      </TextureCard>
      <MorphingDialogContainer>
        <MorphingDialogContent className={`project-dialog ${paper ? 'project-dialog-paper' : ''}`}>
          <MorphingDialogClose aria-label={lang === 'en' ? 'Close preview' : '关闭预览'} />
          <div className="project-dialog-art"><MorphingDialogImage src={image} alt={project.cover[lang]} width={paper ? 953 : 1383} height={paper ? 1270 : 1255} /></div>
          <div className="project-dialog-body">
            <p className="repository-kind">{kind}</p>
            <MorphingDialogTitle><h2>{p.title}</h2></MorphingDialogTitle>
            <MorphingDialogDescription><p>{p.detail}</p></MorphingDialogDescription>
            {paper && <div className="project-dialog-citation"><p>Combining the theoretical bound and deep adversarial network for machinery open-set diagnosis transfer</p><span>Yafei Deng, Jun Lv, Delin Huang, Shichang Du</span><span>Neurocomputing 548 (2023), 126391</span></div>}
            <div className="project-dialog-links"><a className="paper-link" href={paper ? 'https://doi.org/10.1016/j.neucom.2023.126391' : project.cover.source} target="_blank" rel="noreferrer">{source}<Arrow diagonal /></a><a href={`https://github.com/phoenixdyf/${project.slug}`} target="_blank" rel="noreferrer">GitHub<Arrow diagonal /></a></div>
            <p className="project-dialog-caption">{paper ? (lang === 'en' ? 'Original publication · First page' : '原始论文 · 首页') : (lang === 'en' ? 'Excerpt from the repository documentation' : '节选自仓库说明文档')}</p>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  </article>
}

export default function ProjectCollection({ lang }: { lang: Lang }) {
  const orderedProjects = [...projects].sort((a, b) => Number(b.cover.kind === 'paper') - Number(a.cover.kind === 'paper'))
  return <div className="repository-collection" id="work">{orderedProjects.map(project => <ProjectCard key={project.slug} project={project} lang={lang} />)}</div>
}
