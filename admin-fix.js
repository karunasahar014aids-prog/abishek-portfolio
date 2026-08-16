/* ============================================================
   ADMIN IMAGE FIX
   - Converts HEIC/HEIF photos to browser-friendly JPEG
   - Makes the preview work before saving
   - Prevents unsupported image uploads from silently failing
============================================================ */
(function () {
  let converterPromise = null;

  function loadConverter() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (converterPromise) return converterPromise;

    converterPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      script.onload = () => resolve(window.heic2any);
      script.onerror = () => reject(new Error('HEIC converter could not be loaded.'));
      document.head.appendChild(script);
    });
    return converterPromise;
  }

  function isHeic(file) {
    if (!file) return false;
    const name = String(file.name || '').toLowerCase();
    const type = String(file.type || '').toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') || type === 'image/heic' || type === 'image/heif';
  }

  async function convertIfNeeded(file) {
    if (!isHeic(file)) return file;

    const converter = await loadConverter();
    const result = await converter({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const base = (file.name || 'photograph').replace(/\.(heic|heif)$/i, '');
    return new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
  }

  function putFileBack(input, file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }

  async function handleImageInput(input) {
    const original = input.files && input.files[0];
    if (!original) return;

    try {
      const converted = await convertIfNeeded(original);
      if (converted !== original) putFileBack(input, converted);

      const preview = document.getElementById('imagePreview');
      if (!preview) return;
      const url = URL.createObjectURL(converted);
      preview.innerHTML = `
        <div class="current-image live-preview">
          <img src="${url}" alt="Image preview">
          <span>${converted.name} · Ready to upload</span>
        </div>`;
    } catch (error) {
      console.error(error);
      const preview = document.getElementById('imagePreview');
      if (preview) preview.innerHTML = '<div class="empty-state"><strong>Could not preview this image</strong><p>Please choose JPG, JPEG or PNG.</p></div>';
      alert('This HEIC photo could not be converted. Please try JPG/JPEG/PNG.');
    }
  }

  document.addEventListener('change', function (event) {
    if (event.target && event.target.id === 'posterImage') {
      handleImageInput(event.target);
    }
  });

  const originalSave = window.savePoster;
  if (typeof originalSave === 'function') {
    window.savePoster = async function () {
      const input = document.getElementById('posterImage');
      const file = input && input.files && input.files[0];
      if (file && isHeic(file)) {
        try {
          const converted = await convertIfNeeded(file);
          putFileBack(input, converted);
        } catch (error) {
          alert('Please upload JPG, JPEG or PNG. HEIC conversion failed.');
          return;
        }
      }
      return originalSave();
    };
  }
})();
