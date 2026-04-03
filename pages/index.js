import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import UserMenu from '../components/UserMenu'

export default function Home() {
  const { data: session } = useSession()
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(0)
  const [guestUses, setGuestUses] = useState(3)
  const [error, setError] = useState('')

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
    setError('')
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
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      // 调用本地 API（含服务端积分扣减）
      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '处理失败')
      }

      const blob = await res.blob()
      setProcessedUrl(URL.createObjectURL(blob))

      if (session) {
        // 服务端已扣积分，前端同步更新显示
        setCredits(prev => prev - 1)
      } else {
        const newUses = guestUses - 1
        setGuestUses(newUses)
        localStorage.setItem('guestUses', newUses)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setOriginalUrl('')
    setProcessedUrl('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🖼️ Image Background Remover
          </h1>
          <div className="flex items-center gap-3">
            {session ? (
              <UserMenu session={session} credits={credits} />
            ) : (
              <>
                <span className="text-sm text-gray-500">免费试用：{guestUses}/3</span>
                <button onClick={() => signIn('google')} className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium shadow-md">
                  登录
                </button>
              </>
            )}
          </div>
        </div>

        {!file ? (
          <div
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-blue-50 cursor-pointer transition-all duration-300"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                📁
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">拖拽图片到这里</p>
                <p className="text-sm text-gray-400 mt-1">或点击选择文件</p>
              </div>
              <p className="text-xs text-gray-400">支持 JPG、PNG、WEBP，最大 10MB</p>
            </div>
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

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                ⚠️ {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">AI 正在移除背景...</span>
              </div>
            )}

            <div className="flex gap-4 justify-center mt-4">
              <button onClick={removeBackground} disabled={loading || (session && credits <= 0)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium shadow-lg transition">
                ✨ 移除背景
              </button>
              {processedUrl && (
                <a href={processedUrl} download={file.name.replace(/\.[^.]+$/, '_nobg.png')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 font-medium shadow-lg transition">
                  ⬇️ 下载
                </a>
              )}
              <button onClick={reset}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-200 font-medium transition">
                🔄 重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
