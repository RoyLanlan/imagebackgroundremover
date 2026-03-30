import formidable from 'formidable'
import { removeBackground } from '@imgly/background-removal-node'
import fs from 'fs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable()
  const [fields, files] = await form.parse(req)
  const file = files.image[0]
  
  const imageBuffer = fs.readFileSync(file.filepath)
  const blob = await removeBackground(imageBuffer)
  const buffer = Buffer.from(await blob.arrayBuffer())
  
  res.setHeader('Content-Type', 'image/png')
  res.send(buffer)
}
