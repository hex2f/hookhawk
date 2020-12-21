import { ui_error, ui_info, ui_success } from './log'
import fs from 'fs'
import child_process from 'child_process'
import path from 'path'
import crypto from 'crypto'
import chalk from 'chalk'
import { promisify } from 'util'

const exists = promisify(fs.exists)
const randomBytes = promisify(crypto.randomBytes)
const writeFile = promisify(fs.writeFile)
const exec = promisify(child_process.exec)

export default async function newApp(name: string, uri: string) {
  const appPath = path.join(process.cwd(), name)
  if (await exists(appPath)) { return ui_error(`${name} already exists.`) }
  ui_info(`Cloning ${uri} into ${name}`)
  await exec(`git clone ${uri} ${name}`)
  const secret = (await randomBytes(16)).toString('hex')
  await writeFile(path.join(appPath, '.hawkcfg'), secret)

  ui_success(`Success!\n  Webhook Path: ${chalk.bold('/'+name)}\n  Secret: ${chalk.bold(secret)}`)
}