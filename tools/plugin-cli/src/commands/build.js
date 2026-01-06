import { spawn } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'

export async function buildPlugin(options) {
  console.log(chalk.cyan.bold('\n🔨 构建插件\n'))

  const spinner = ora('正在构建...').start()

  const args = ['run', 'build']
  if (options.watch) {
    args.push('--', '--watch')
  }

  const build = spawn('npm', args, {
    stdio: 'inherit',
    shell: true
  })

  build.on('close', (code) => {
    if (code === 0) {
      spinner.succeed(chalk.green('构建完成！'))
    } else {
      spinner.fail(chalk.red('构建失败'))
      process.exit(code)
    }
  })

  build.on('error', (error) => {
    spinner.fail(chalk.red('构建失败'))
    console.error(chalk.red(error.message))
    process.exit(1)
  })
}
