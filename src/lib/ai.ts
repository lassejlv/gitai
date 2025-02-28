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
    model: google('gemini-2.0-pro-exp'),
    messages: [
      {
        role: 'system',
        content:
          'your job is to generate a short good commit message based on the users changes from the file provdided. Only output something about the file. Do it like <file_name>: <short_message>; etc; Everything should be in one line.',
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
