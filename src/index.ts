import consola from 'consola'
import { GenerateCommand } from './commands/generate'

const command = process.argv[2]

switch (command) {
  case 'generate': {
    GenerateCommand()
    break
  }

  default: {
    consola.error(`Unknown command at ${command}`)
    break
  }
}
