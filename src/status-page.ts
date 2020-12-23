import { Server, Socket } from "socket.io"
import pm2 from 'pm2'
import { error } from "./log"

export interface AppState {
  name: string
  status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored' | 'one-launch-status'
  uptime: number
  memory: number
  cpu: number
}

export default class StatusPage {
  io: Server
  state: Array<AppState> = []
  lastStateTime: number = 0

  constructor(io: Server) {
    this.io = io
    this.io.on('connection', (socket: Socket) => {
      socket.on('getStates', () => {
        if (Date.now() - this.lastStateTime > 2000) {
          this.lastStateTime = Date.now()
          this.update()
        } else {
          socket.emit('stateChange', this.state)
        }
      })
    })
  }

  update() {
    pm2.connect(err => {
      if (err) return error(err)
      pm2.list((err, list) => {
        if (err) return error(err)
        this.state = list.map(proc => ({
          name: proc.name || 'unknown',
          status: proc.pm2_env!.status || 'stopped',
          uptime: Date.now() - (proc.pm2_env!.pm_uptime || Date.now()),
          memory: proc.monit!.memory || 0,
          cpu: proc.monit!.cpu || 0,
        }))
        this.io.emit('stateChange', this.state)
      })
    })
  }
}