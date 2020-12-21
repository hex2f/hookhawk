import Server from './server'
import NewApp from './new-app'

import { usageError } from './log'

switch (process.argv[2]) {
  case "start": {
    Server(process.cwd(), parseInt(process.argv[3]) || 8081)
    break;
  }
  case "add": {
    if (!process.argv[3] || !process.argv[4]) { usageError(); break }
    NewApp(process.argv[3].toLowerCase(), process.argv[4])
    break
  }
  default: {
    usageError()
  }
}