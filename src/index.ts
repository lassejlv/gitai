import consola from 'consola'
import { GenerateCommand } from './commands/generate'

const command = process.argv[2]

switch (command) {
	case 'generate': {
		if (!Bun.env.GOOGLE_API_KEY) {
			consola.error('Missing GOOGLE_API_KEY')
			consola.info(
				"You can set your key in a .env file or use this cmd: export GOOGLE_API_KEY='YOUR_KEY'\n\nmore models will be supported soon"
			)
			process.exit(1)
		}

		GenerateCommand()
		break
	}

	case 'help': {
		consola.info('Usage: gen-ai-commit-message <command>\n\nCommands:\n  generate\n  help')
		break
	}

	default: {
		consola.error(`Unknown command at ${command || 'no command provided'}`)
		break
	}
}
