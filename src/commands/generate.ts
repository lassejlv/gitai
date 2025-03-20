import { $ } from 'bun'
import { generateCommitMessage } from '../lib/ai'
import clipboardy from 'clipboardy'
import ora from 'ora'
import consola from 'consola'

let all_changes = ''

export const GenerateCommand = async () => {
  const git_status = await $`git status -s --untracked-files=no`.quiet()

  const files_changed = git_status.stdout
    .toString()
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.trim().substring(2))

  for (const file of files_changed) {
    const diff = await $`git diff -- ${file}`.quiet()

    const patch = await $`git diff --patch -- ${file}`.quiet()

    const diff_text = diff.stdout
      .toString()
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')

    const patch_text = patch.stdout
      .toString()
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')

    all_changes += `${file}\n`
    all_changes += diff_text
    all_changes += '\n'
    all_changes += patch_text
    all_changes += '\n'
    all_changes += '\n'
  }

  const id = Bun.randomUUIDv7()

  const spinner = ora('Generating commit message...').start()
  await Bun.write(`tmp/git_changes-${id}.txt`, all_changes)
  const commit_message = await generateCommitMessage(`tmp/git_changes-${id}.txt`)

  let cmd = ''

  const fullGitCommand = process.argv.includes('--full')
  const pushToGithub = process.argv.includes('--push')

  if (fullGitCommand && pushToGithub) {
    consola.error('You can not use --full and --push at the same time')
    process.exit(1)
  }

  if (fullGitCommand) {
    cmd = `git commit -m "${commit_message}"`
  } else {
    cmd = commit_message
  }

  await clipboardy.write(cmd)

  await $`rm -rf tmp`
  spinner.succeed(`Generated! + copied to clipboard ${fullGitCommand && '(with git command)'}`)

  if (!pushToGithub) process.exit(0)

  const wichFiles = prompt('\nWhat files you want to push? ')

  if (!wichFiles) return consola.error('No files selected')

  const currentBranch = (await $`git branch --show-current`.quiet()).stdout.toString().trim()

  const pushing = ora('Pushing to github...').start()

  if (wichFiles === '.') {
    await $`git add . && git commit -m "${commit_message}" && git push origin ${currentBranch}`.quiet()
  } else {
    await $`git add ${wichFiles} && git commit -m "${commit_message}" && git push origin ${currentBranch}`.quiet()
  }

  pushing.succeed('Pushed!')
  process.exit(0)
}
