import consola from 'consola'

const commands = [
	{
		name: 'generate',
		description: 'Generate a commit message based on the AI'
	},
	{
		name: 'help',
		description: 'Show this help'
	},
	{
		name: 'version',
		description: 'Show the version'
	}
]

export const HelpCommand = async () => {
	const formattedCommands = commands.map((command) => {
		return `  ${command.name} - ${command.description}`
	})

	consola.info(`Usage: gen-ai-commit-message <command>\n\nCommands:\n${formattedCommands.join('\n')}`)
}
