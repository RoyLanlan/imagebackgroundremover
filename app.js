const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImg = document.getElementById('originalImg');
const processedImg = document.getElementById('processedImg');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const loading = document.getElementById('loading');

let currentFile = null;

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    if (file.size > 10 * 1024 * 1024) {
        alert('文件太大，请选择小于 10MB 的图片');
        return;
    }
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImg.src = e.target.result;
        processedImg.src = '';
        uploadArea.style.display = 'none';
        previewContainer.style.display = 'block';
        downloadBtn.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

removeBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    
    loading.style.display = 'block';
    removeBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('image', currentFile);
    
    try {
        const response = await fetch('/remove-background', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('处理失败');
        
        const blob = await response.blob();
        processedImg.src = URL.createObjectURL(blob);
        downloadBtn.style.display = 'inline-block';
    } catch (error) {
        alert('处理失败: ' + error.message);
    } finally {
        loading.style.display = 'none';
        removeBtn.disabled = false;
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = processedImg.src;
    link.download = currentFile.name.replace(/\.[^.]+$/, '_nobg.png');
    link.click();
});

resetBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
});
