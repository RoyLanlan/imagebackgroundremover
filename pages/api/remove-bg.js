import formidable from 'formidable'
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
  
  const formData = new FormData()
  formData.append('image_file_b64', imageBuffer.toString('base64'))
  formData.append('size', 'auto')
  
  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Remove.bg error:', error)
      return res.status(500).json({ error: 'Background removal failed' })
    }
    
    const resultBuffer = await response.arrayBuffer()
    
    res.setHeader('Content-Type', 'image/png')
    res.send(Buffer.from(resultBuffer))
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: error.message })
  }
}
