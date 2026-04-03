import formidable from 'formidable'
import fs from 'fs'
import { deductCredit, getCredits } from '../../lib/credits'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // 验证登录
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: '请先登录' })
  }

  // 服务端检查积分
  const credits = await getCredits(session.user.email)
  if (credits <= 0) {
    return res.status(403).json({ error: '积分不足，请先购买积分' })
  }

  // 解析上传图片
  const form = formidable()
  const [fields, files] = await form.parse(req)
  const file = files.image?.[0]

  if (!file) {
    return res.status(400).json({ error: '未检测到图片' })
  }

  const imageBuffer = fs.readFileSync(file.filepath)

  try {
    // 调用 Cloudflare Worker 处理
    const formData = new FormData()
    formData.append('image', new Blob([imageBuffer], { type: file.mimetype || 'image/png' }))

    const response = await fetch('https://imagebackgroundremover-api.roylanlan1115.workers.dev', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Cloudflare Worker error:', error)
      return res.status(500).json({ error: '图片处理失败' })
    }

    const resultBuffer = await response.arrayBuffer()

    // 扣除积分（仅在处理成功后）
    await deductCredit(session.user.email)

    res.setHeader('Content-Type', 'image/png')
    res.send(Buffer.from(resultBuffer))
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: error.message })
  }
}
