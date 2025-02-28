import { $ } from 'bun'
import consola from 'consola'
import { generateCommitMessage } from '../lib/ai'
import clipboardy from 'clipboardy'

let all_changes: string = ''

export const GenerateCommand = async () => {
  const git_status = await $`git status -s --untracked-files=no`.quiet()

  const files_changed = git_status.stdout
    .toString()
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.trim().substring(2))

  for (const file of files_changed) {
    // Get the diff between the staged/HEAD version and the working copy
    const diff = await $`git diff -- ${file}`.quiet()

    // Get the diff with patch info
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

  await Bun.write(`tmp/git_changes-${id}.txt`, all_changes)
  consola.success(`All changes found, generating commit message...`)

  const commit_message = await generateCommitMessage(`tmp/git_changes-${id}.txt`)
  await clipboardy.write(commit_message)
  await $`rm -rf tmp`
  consola.success(`Commit message copied to clipboard!`)
}
