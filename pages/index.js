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
  const [guestUses, setGuestUses] = useState(3)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    } else {
      const uses = localStorage.getItem('guestUses')
      setGuestUses(uses ? parseInt(uses) : 3)
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
    
    if (session) {
      if (credits <= 0) {
        alert('积分不足，请购买积分')
        return
      }
    } else {
      if (guestUses <= 0) {
        alert('免费试用次数已用完，请登录购买积分')
        return
      }
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('https://imagebackgroundremover-api.roylanlan1115.workers.dev', { method: 'POST', body: formData })
      const blob = await res.blob()
      setProcessedUrl(URL.createObjectURL(blob))
      
      if (session) {
        setCredits(credits - 1)
      } else {
        const newUses = guestUses - 1
        setGuestUses(newUses)
        localStorage.setItem('guestUses', newUses)
      }
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🖼️ Image Background Remover</h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/pricing" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
                  💎 {credits} 积分 | 购买
                </Link>
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
                <span className="text-gray-600 text-sm">{session.user.name}</span>
                <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-red-500 underline">退出</button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">免费试用：{guestUses}/3 次</span>
                <button onClick={() => signIn('google')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                  登录获取更多
                </button>
              </>
            )}
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
