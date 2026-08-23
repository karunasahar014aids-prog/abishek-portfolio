/* ============================================================
   ABISHEK STUDIO — ROBUST ADMIN PHOTO UPLOAD FIX
   - Keeps the existing edit/delete/publish features intact.
   - Replaces only the ADD-PHOTOGRAPH save path.
   - Supports JPG/JPEG/PNG/WebP/GIF and converts HEIC/HEIF to JPEG.
   - Shows the real upload/database error instead of failing silently.
   - Cleans up the uploaded file if the database insert fails.
============================================================ */
(function () {
  const SUPABASE_URL = 'https://jaryhmtzzassnzomtsch.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  const BUCKET = 'posters';

  let client = null;
  let heicLoader = null;

  function getClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase library is not loaded. Refresh the admin page and try again.');
    }
    if (!client) client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return client;
  }

  function isHeic(file) {
    const name = String(file?.name || '').toLowerCase();
    const type = String(file?.type || '').toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') || type === 'image/heic' || type === 'image/heif';
  }

  function loadHeicConverter() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (heicLoader) return heicLoader;

    heicLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      script.onload = () => window.heic2any ? resolve(window.heic2any) : reject(new Error('HEIC converter loaded incorrectly.'));
      script.onerror = () => reject(new Error('Could not load the HEIC converter. Please use JPG, PNG or WebP.'));
      document.head.appendChild(script);
    });
    return heicLoader;
  }

  async function normalizeImage(file) {
    if (!isHeic(file)) return file;

    const converter = await loadHeicConverter();
    const result = await converter({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    const base = String(file.name || 'photograph').replace(/\.(heic|heif)$/i, '');
    return new File([blob], `${base}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  }

  function setStatus(text, isError = false) {
    let status = document.getElementById('admin-upload-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'admin-upload-status';
      status.style.cssText = 'margin-top:12px;padding:10px 12px;border-radius:10px;font:600 13px/1.4 Arial,sans-serif;';
      const actions = document.querySelector('.form-actions');
      if (actions) actions.insertAdjacentElement('afterend', status);
    }
    status.textContent = text;
    status.style.background = isError ? 'rgba(239,68,68,.10)' : 'rgba(34,197,94,.10)';
    status.style.color = isError ? '#b91c1c' : '#15803d';
    status.style.border = `1px solid ${isError ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.25)'}`;
  }

  function clearStatus() {
    const status = document.getElementById('admin-upload-status');
    if (status) status.remove();
  }

  async function robustAddPhoto() {
    const titleEl = document.getElementById('posterTitle');
    const categoryEl = document.getElementById('posterCategory');
    const locationEl = document.getElementById('posterLocation');
    const dateEl = document.getElementById('posterDate');
    const descriptionEl = document.getElementById('posterDescription');
    const imageInput = document.getElementById('posterImage');

    const title = titleEl?.value.trim() || '';
    const category = categoryEl?.value || 'other';
    const location = locationEl?.value.trim() || '';
    const date = dateEl?.value.trim() || '';
    const description = descriptionEl?.value.trim() || '';
    const originalFile = imageInput?.files?.[0];

    if (!title) {
      setStatus('Please enter a photo title.', true);
      return;
    }
    if (!originalFile) {
      setStatus('Please choose a photograph.', true);
      return;
    }
    if (originalFile.size > 15 * 1024 * 1024) {
      setStatus('Image must be under 15 MB.', true);
      return;
    }

    const saveButton = document.querySelector('.save-btn');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.dataset.originalText = saveButton.textContent;
      saveButton.textContent = 'Uploading photograph…';
    }

    let uploadedName = null;

    try {
      setStatus(isHeic(originalFile) ? 'Converting HEIC → JPEG…' : 'Preparing photograph…');
      const file = await normalizeImage(originalFile);

      const supabase = getClient();
      const safeName = String(file.name || 'photograph.jpg').replace(/[^a-zA-Z0-9._-]/g, '-');
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

      setStatus('Uploading photograph to secure storage…');
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      uploadedName = fileName;

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const imageUrl = publicData?.publicUrl;
      if (!imageUrl) throw new Error('The image uploaded, but its public URL could not be created.');

      setStatus('Saving photograph details…');
      const { data: lastPoster, error: orderError } = await supabase
        .from('posters')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      if (orderError) throw new Error(`Could not calculate photo order: ${orderError.message}`);

      const order = lastPoster?.length ? Number(lastPoster[0].display_order || 0) + 1 : 1;

      const { error: insertError } = await supabase.from('posters').insert({
        title,
        category,
        location,
        date,
        description,
        image_url: imageUrl,
        display_order: order,
        published: true
      });

      if (insertError) throw new Error(`Photo details could not be saved: ${insertError.message}`);

      setStatus('Photograph added successfully ✓ It is now published.');
      if (typeof window.loadPosters === 'function') await window.loadPosters();

      if (titleEl) titleEl.value = '';
      if (locationEl) locationEl.value = '';
      if (dateEl) dateEl.value = '';
      if (descriptionEl) descriptionEl.value = '';
      if (categoryEl) categoryEl.value = 'portrait';
      if (imageInput) imageInput.value = '';
      const preview = document.getElementById('imagePreview');
      if (preview) preview.innerHTML = '';

    } catch (error) {
      console.error('Admin photo upload failed:', error);
      setStatus(error?.message || 'Photo upload failed. Please try again.', true);

      if (uploadedName) {
        try {
          await getClient().storage.from(BUCKET).remove([uploadedName]);
        } catch (cleanupError) {
          console.warn('Uploaded file cleanup failed:', cleanupError);
        }
      }
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = saveButton.dataset.originalText || 'Save Photograph →';
      }
    }
  }

  const previousSavePoster = window.savePoster;
  if (typeof previousSavePoster !== 'function') return;

  window.savePoster = async function () {
    const formTitle = document.getElementById('formTitle');
    const isAddMode = !formTitle || formTitle.textContent.trim() === 'Add New Photograph';

    // Keep the existing edit behaviour exactly as it is.
    if (!isAddMode) return previousSavePoster();

    clearStatus();
    return robustAddPhoto();
  };
})();
