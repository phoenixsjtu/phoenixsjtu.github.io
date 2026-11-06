import { spawnSync } from 'node:child_process'
import { cpSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const app = join(root, 'app')
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: app, stdio: 'inherit' })
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
for (const entry of readdirSync(join(app, 'dist'))) {
  cpSync(join(app, 'dist', entry), join(root, entry), { recursive: true })
}
console.log('Static site copied to the repository root.')
