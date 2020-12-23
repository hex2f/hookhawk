import express from 'express'
import crypto from 'crypto'
import fs from 'fs'
import child_process from 'child_process'
import path from 'path'
import chalk from 'chalk'
import { promisify } from 'util'

import { info, error, success } from './log'
import StatusPage from './status-page'

const exists = promisify(fs.exists)
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const exec = promisify(child_process.exec)

function signData(secret: string, data: any) {
	return 'sha256=' + crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function verifySignature(secret: string, data: any, signature: string) {
	return Buffer.from(signature).compare(Buffer.from(signData(secret, data))) == 0
}

export default async function start(appsPath: string, port: number) {
  info(`Creating server on :${port} in ${appsPath}`)

  const app = express()
  const http = require('http').createServer(app)
  const io = require('socket.io')(http)

  app.use(express.json())

  new StatusPage(io)

  info(`Searching for apps in ${appsPath}`)
  for (const dir of await readdir(appsPath)) {
    if (await exists(path.join(appsPath, dir, 'hawk.sh'))) {
      await exec(`cd ${dir} && sh hawk.sh`)
      success(`Started ${dir}`)
    }
  }

  app.get('/', (req, res) => res.sendFile(path.resolve('status_page.html')))

  app.post('/:app', async (req, res) => {
    const appName = req.params.app as string
    
    info(`[${appName}] Webhook called`)

    const appPath = path.resolve(appsPath, appName)

    if (!await exists(appPath)) {
      info(`[${appName}] Hook does not exist`)
      return res.sendStatus(404)
    }

    const hawkcfgPath = path.join(appPath, '.hawkcfg')
    if (!await exists(hawkcfgPath)) {
      error(`[${appName}] No .hawkcfg found, please remove ${chalk.italic(appPath)} then reinitialize using ${chalk.bold(`hookhawk add ${appName} <git uri>`)}`)
      return res.sendStatus(404)
    }

    const signature = req.headers['x-hub-signature-256']
    if (!signature) {
      error(`[${appName}] No signature provided`)
      return res.sendStatus(401)
    }

    const secret = await readFile(hawkcfgPath, 'utf-8')
    info(`[${appName}] secret: ${secret}, signature: ${signature}`)
    if (!verifySignature(secret, JSON.stringify(req.body), signature as string)) {
      error(`[${appName}] Invalid signature`)
      return res.sendStatus(401)
    } else {
      info(`[${appName}] Signature validated`)
    }

    const prehawkPath = path.join(appPath, 'prehawk.sh')
    const hawkPath = path.join(appPath, 'hawk.sh')
    if (await exists(prehawkPath)) {
      info(`[${appName}] Running prehawk script`)
      await exec(`cd ${appPath} && sh prehawk.sh`)
    }

    info(`[${appName}] Pulling updates`)
    await exec(`git -C "${appPath}" pull`)

    if (await exists(hawkPath)) {
      info(`[${appName}] Running hawk script`)
      await exec(`cd ${appPath} && sh hawk.sh`)
    }

    success(`[${appName}] Deployed`)

    res.sendStatus(200)
  })

  http.listen(port, () => {
    info(`Listening on :${port}`)
  })
}