import chalk from 'chalk'

function time(): string {
  return chalk.gray(`[${Date().toString()}]`)
}

export function success(...a: any) {
  console.log(chalk.green(`[Success]`), time(), ...a)
}

export function ui_success(...a: any) {
  console.log(chalk.green(`⬢`), ...a)
}

export function info(...a: any) {
  console.log(chalk.blue(`[Info]`), time(), ...a)
}

export function ui_info(...a: any) {
  console.log(chalk.blue(`⬢`), ...a)
}

export function warn(...a: any) {
  console.warn(chalk.yellow(`[Warn]`), time(), ...a)
}

export function ui_warn(...a: any) {
  console.log(chalk.yellow(`⬢`), ...a)
}

export function error(...a: any) {
  console.error(chalk.red(`[Error]`), time(), ...a)
}

export function ui_error(...a: any) {
  console.log(chalk.red(`⬢`), ...a)
}

export function usageError() {
  console.log('Usage: hookhawk <command>\n')
  console.log('Available commands:')
  console.log('  hookhawk start <?port> - Starts the webhook server on an optional port (8081 by default)')
  console.log('  hookhawk add <name> <git uri> <?branch> - Clones and sets up a new app from the provided git uri')
}