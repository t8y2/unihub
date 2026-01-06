import { spawn } from 'child_process'
import chalk from 'chalk'

export async function devPlugin(options) {
  console.log(chalk.cyan.bold('\n🚀 启动开发服务器\n'))
  console.log(chalk.gray(`端口: ${options.port}\n`))

  const dev = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: options.port
    }
  })

  dev.on('error', (error) => {
    console.error(chalk.red('启动失败:'), error.message)
    process.exit(1)
  })
}
