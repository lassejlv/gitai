import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { resolve } from 'path'

const google = createGoogleGenerativeAI({ apiKey: Bun.env.GOOGLE_API_KEY })

export const generateCommitMessage = async (git_changes_path: string) => {
  const absolutePath = resolve(git_changes_path)
  // Read file content
  const fileContent = await Bun.file(absolutePath).text()

  // Create a base64-encoded data URL
  const base64Content = Buffer.from(fileContent).toString('base64')
  const dataUrl = `data:text/plain;base64,${base64Content}`

  const { text } = await generateText({
    model: google('gemini-2.0-pro-exp-02-05'),
    messages: [
      {
        role: 'system',
        content: `'Generate a concise git commit message in conventional commit format based on the provided changes. Use prefixes like feat, fix, refactor, docs, style, etc. followed by a brief summary of the overall change. Do NOT list individual files or include file paths. Keep it under 72 characters if possible, focusing on the main purpose of the change. Example: "refactor: Improve error handling in authentication flow" or "fix: Resolve race condition in data loading"'
`,
      },
      {
        role: 'user',
        content: 'These are my changes',
        experimental_attachments: [
          {
            name: 'git_changes',
            contentType: 'text/plain',
            url: dataUrl,
          },
        ],
      },
    ],
  })

  return text
}
