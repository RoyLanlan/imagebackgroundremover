import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session } = useSession()
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    }
  }, [session])

  const handleFile = (selectedFile) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('文件太大，请选择小于 10MB 的图片')
      return
    }
    setFile(selectedFile)
    setOriginalUrl(URL.createObjectURL(selectedFile))
    setProcessedUrl('')
  }

  const removeBackground = async () => {
    if (!file) return
    if (credits <= 0) {
      alert('积分不足，请购买积分')
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('https://imagebackgroundremover-api.roylanlan1115.workers.dev', { method: 'POST', body: formData })
      const blob = await res.blob()
      setProcessedUrl(URL.createObjectURL(blob))
      setCredits(credits - 1)
    } catch (error) {
      alert('处理失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setOriginalUrl('')
    setProcessedUrl('')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">🖼️ Image Background Remover</h1>
          <p className="text-gray-600 mb-6">请先登录使用服务</p>
          <button onClick={() => signIn('google')} className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            使用 Google 登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🖼️ Image Background Remover</h1>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
              💎 {credits} 积分 | 购买
            </Link>
            <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
            <span className="text-gray-600 text-sm">{session.user.name}</span>
            <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-red-500 underline">退出</button>
          </div>
        </div>

        {!file ? (
          <div
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-20 text-center hover:border-green-500 hover:bg-gray-50 cursor-pointer transition"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <p className="text-xl text-gray-600">📁 拖拽图片到这里或点击上传</p>
            <p className="text-sm text-gray-400 mt-2">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
            <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">原图</h3>
                <img src={originalUrl} alt="原图" className="w-full rounded-lg shadow" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">处理后</h3>
                {processedUrl ? (
                  <img src={processedUrl} alt="处理后" className="w-full rounded-lg shadow" />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">等待处理...</p>
                  </div>
                )}
              </div>
            </div>

            {loading && <p className="text-center text-gray-600 mb-4">⏳ 正在处理中...</p>}

            <div className="flex gap-4 justify-center">
              <button onClick={removeBackground} disabled={loading} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50">
                移除背景
              </button>
              {processedUrl && (
                <a href={processedUrl} download={file.name.replace(/\.[^.]+$/, '_nobg.png')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                  下载图片
                </a>
              )}
              <button onClick={reset} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                重新上传
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
