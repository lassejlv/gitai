import { $ } from 'bun'
import consola from 'consola'

export const GenerateCommand = async () => {
  const git_history = await $`git log --pretty=format:"%H" -n 1`
  console.log(git_history)
}
