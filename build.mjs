import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const app = join(root, 'app')
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: app, stdio: 'inherit' })
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

// Only hashed, generated root assets are replaced. Source and other root files stay intact.
rmSync(join(root, 'assets'), { recursive: true, force: true })
for (const entry of readdirSync(join(app, 'dist'))) {
  cpSync(join(app, 'dist', entry), join(root, entry), { recursive: true })
}
mkdirSync(join(root, 'downloads'), { recursive: true })
cpSync(join(app, 'downloads', 'refined-3d-backgrounds.zip'), join(root, 'downloads', 'refined-3d-backgrounds.zip'))
console.log('Static site and approved background archive copied to the repository root.')
