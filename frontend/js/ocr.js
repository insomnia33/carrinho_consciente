// ocr.js - Lógica de OCR usando Tesseract.js

// Carrega Tesseract.js dinamicamente se não estiver presente
export async function ensureTesseractLoaded() {
    if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.1/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Abre o modal de OCR e retorna uma Promise com o valor selecionado
export function openOcrModal(onValueSelected) {
    let modal = document.getElementById('ocrModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ocrModal';
        modal.innerHTML = `
            <div class="ocr-modal-content">
                <span class="ocr-close">&times;</span>
                <h2>Escanear Preço</h2>
                <input type="file" accept="image/*" capture="environment" id="ocrImageInput">
                <div id="ocrImagePreview"></div>
                <div id="ocrLoading" style="display:none;">Processando imagem...</div>
                <div id="ocrResults"></div>
            </div>
        `;
        document.body.appendChild(modal);
        // CSS básico para modal
        const style = document.createElement('style');
        style.innerHTML = `
            #ocrModal { position:fixed;z-index:9999;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center; }
            .ocr-modal-content { background:#fff;padding:20px;border-radius:8px;max-width:95vw;max-height:95vh;overflow:auto;position:relative; }
            .ocr-close { position:absolute;top:10px;right:20px;font-size:2em;cursor:pointer; }
            #ocrImagePreview img { max-width:90vw;max-height:40vh;display:block;margin:10px auto; }
            .ocr-bbox { position:absolute;border:2px solid #4caf50;background:rgba(76,175,80,0.2);cursor:pointer; }
        `;
        document.head.appendChild(style);
    }
    modal.style.display = 'flex';
    // Fechar modal
    modal.querySelector('.ocr-close').onclick = () => { modal.style.display = 'none'; };
    // Limpa resultados
    document.getElementById('ocrResults').innerHTML = '';
    document.getElementById('ocrImagePreview').innerHTML = '';
    document.getElementById('ocrLoading').style.display = 'none';
    // Ao selecionar imagem
    const input = document.getElementById('ocrImageInput');
    input.value = '';
    // Dispara o seletor de imagem automaticamente ao abrir o modal
    setTimeout(() => { input.click(); }, 100);
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imgURL = URL.createObjectURL(file);
        const previewDiv = document.getElementById('ocrImagePreview');
        previewDiv.innerHTML = `<div style='position:relative;display:inline-block;'><img id='ocrImg' src='${imgURL}'></div>`;
        document.getElementById('ocrLoading').style.display = 'block';
        await ensureTesseractLoaded();
        window.Tesseract.recognize(
            imgURL,
            'por',
            { logger: m => {} }
        ).then(({ data }) => {
            document.getElementById('ocrLoading').style.display = 'none';
            const img = document.getElementById('ocrImg');
            const container = img.parentElement;
            // Usa as dimensões reais da imagem renderizada
            const imgWidth = img.naturalWidth || img.width;
            const imgHeight = img.naturalHeight || img.height;
            // Desenha bounding boxes para números
            const numbers = data.words.filter(w => /\d+[\d,.]*/.test(w.text));
            numbers.forEach(word => {
                const bbox = document.createElement('div');
                bbox.className = 'ocr-bbox';
                // Usa proporção da imagem original para a exibida
                bbox.style.left = (word.bbox.x0 * img.width / imgWidth) + 'px';
                bbox.style.top = (word.bbox.y0 * img.height / imgHeight) + 'px';
                bbox.style.width = ((word.bbox.x1 - word.bbox.x0) * img.width / imgWidth) + 'px';
                bbox.style.height = ((word.bbox.y1 - word.bbox.y0) * img.height / imgHeight) + 'px';
                bbox.title = word.text;
                bbox.onclick = () => {
                    modal.style.display = 'none';
                    onValueSelected(word.text.replace(',', '.').replace(/[^\d.]/g, ''));
                };
                container.appendChild(bbox);
            });
            if (numbers.length === 0) {
                document.getElementById('ocrResults').innerHTML = '<p>Nenhum valor numérico detectado.</p>';
            } else {
                document.getElementById('ocrResults').innerHTML = '<p>Clique sobre o valor correto na imagem.</p>';
            }
        });
    };
}
