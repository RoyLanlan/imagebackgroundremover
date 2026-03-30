import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('https://imagebackgroundremover-api.roylanlan1115.workers.dev', { method: 'POST', body: formData })
      const blob = await res.blob()
      setProcessedUrl(URL.createObjectURL(blob))
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
        <h1 className="text-4xl font-bold text-center mb-8">🖼️ Image Background Remover</h1>
        
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
