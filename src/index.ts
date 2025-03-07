import consola from 'consola'
import { GenerateCommand } from './commands/generate'
import { HelpCommand } from './commands/help'
import { version } from '../package.json'

const command = process.argv[2]

if (!command) {
  HelpCommand()
  process.exit(0)
}

switch (command) {
  case 'generate': {
    if (!Bun.env.GOOGLE_API_KEY) {
      consola.error('Missing GOOGLE_API_KEY')
      consola.info("You can set your key in a .env file or use this cmd: export GOOGLE_API_KEY='YOUR_KEY'\n\nmore models will be supported soon")
      process.exit(1)
    }

    GenerateCommand()
    break
  }

  case 'help': {
    HelpCommand()
    break
  }

  case 'version':
  case '-v':
  case '--version': {
    consola.info(`gitai v${version}`)
    break
  }

  default: {
    consola.error(`Unknown command at ${command || 'no command provided'}`)
    break
  }
}
