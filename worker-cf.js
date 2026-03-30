addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const formData = await request.formData()
  const imageFile = formData.get('image')
  
  if (!imageFile) {
    return new Response('No image provided', { status: 400 })
  }

  const imageBuffer = await imageFile.arrayBuffer()
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

  const removeBgFormData = new FormData()
  removeBgFormData.append('image_file_b64', base64Image)
  removeBgFormData.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': 'igZdy1yMcYhbTq8i4yKCdE9D',
    },
    body: removeBgFormData
  })

  if (!response.ok) {
    return new Response('Background removal failed', { status: 500 })
  }

  const resultBuffer = await response.arrayBuffer()
  
  return new Response(resultBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
