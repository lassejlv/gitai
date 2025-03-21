import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { streamText } from 'ai'
import { resolve } from 'path'

const google = createGoogleGenerativeAI({ apiKey: Bun.env.GOOGLE_API_KEY })

export const generateCommitMessage = async (git_changes_path: string, stream: boolean) => {
  const absolutePath = resolve(git_changes_path)
  // Read file content
  const fileContent = await Bun.file(absolutePath).text()

  // Create a base64-encoded data URL
  const base64Content = Buffer.from(fileContent).toString('base64')
  const dataUrl = `data:text/plain;base64,${base64Content}`
  const model = process.env.GOOGLE_MODEL || "gemini-2.0-flash-001"

  const messages: any[] = [
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
  ]

  let full_output = ''

  if (stream) {
    console.log('Started streaming...')
    console.log('Press Ctrl+C to stop...')
    console.log()

    const { textStream } = streamText({
      model: google(model),
      messages,
    })

    for await (const textPart of textStream) {
      console.log(textPart)
      full_output += textPart
    }
  } else {
    const { text } = await generateText({
      model: google(model),
      messages,
    })

    full_output = text
  }

  return full_output
}
