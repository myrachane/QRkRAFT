let renderer;
let logoImage = null;
let currentText = '';

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

function getOptions() {
  return {
    moduleShape: document.querySelector('#moduleShapeGroup .active')?.dataset.value || 'square',
    finderStyle: document.getElementById('finderStyleSelect').value,
    foregroundColor: document.getElementById('fgColor').value,
    backgroundColor: document.getElementById('bgColor').value,
    transparentBg: document.getElementById('transparentBg').checked,
    moduleSize: parseInt(document.getElementById('moduleSize').value),
    margin: parseInt(document.getElementById('margin').value),
    errorLevel: document.querySelector('#ecGroup .active')?.dataset.value || 'M',
    logoImage,
    logoSize: 0.25
  };
}

async function generate() {
  const text = document.getElementById('inputText').value.trim();
  const canvas = document.getElementById('qrCanvas');
  const emptyState = document.getElementById('emptyState');

  if (!text) {
    canvas.classList.remove('visible');
    emptyState.classList.remove('hidden');
    currentText = '';
    return;
  }

  currentText = text;
  emptyState.classList.add('hidden');
  canvas.classList.add('visible');

  const options = getOptions();

  try {
    const result = await window.electronAPI.generateQR(text, { errorLevel: options.errorLevel });
    if (result.error) {
      console.error('QR generation failed:', result.error);
      return;
    }
    renderer.render(result.modules, options);
  } catch (e) {
    console.error('QR generation failed:', e);
  }
}

const debouncedGenerate = debounce(generate, 200);

function setupShapeButtons() {
  const container = document.getElementById('moduleShapeGroup');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.shape-btn');
    if (!btn) return;
    container.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    debouncedGenerate();
  });
}

function setupECButtons() {
  const container = document.getElementById('ecGroup');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.ec-btn');
    if (!btn) return;
    container.querySelectorAll('.ec-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    debouncedGenerate();
  });
}

function setupControls() {
  setupShapeButtons();
  setupECButtons();

  document.getElementById('inputText').addEventListener('input', debouncedGenerate);
  document.getElementById('finderStyleSelect').addEventListener('change', debouncedGenerate);

  const fgInput = document.getElementById('fgColor');
  const bgInput = document.getElementById('bgColor');
  document.getElementById('fgHex').textContent = fgInput.value;
  document.getElementById('bgHex').textContent = bgInput.value;

  fgInput.addEventListener('input', () => {
    document.getElementById('fgHex').textContent = fgInput.value;
    debouncedGenerate();
  });
  bgInput.addEventListener('input', () => {
    document.getElementById('bgHex').textContent = bgInput.value;
    debouncedGenerate();
  });
  document.getElementById('transparentBg').addEventListener('change', debouncedGenerate);

  const sizeSlider = document.getElementById('moduleSize');
  const marginSlider = document.getElementById('margin');
  document.getElementById('sizeValue').textContent = sizeSlider.value;
  document.getElementById('marginValue').textContent = marginSlider.value;

  sizeSlider.addEventListener('input', () => {
    document.getElementById('sizeValue').textContent = sizeSlider.value;
    debouncedGenerate();
  });

  marginSlider.addEventListener('input', () => {
    document.getElementById('marginValue').textContent = marginSlider.value;
    debouncedGenerate();
  });

  document.getElementById('logoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        logoImage = img;
        document.getElementById('logoPreview').style.display = 'flex';
        document.getElementById('logoImg').src = ev.target.result;
        document.getElementById('logoName').textContent = file.name;
        generate();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeLogo').addEventListener('click', () => {
    logoImage = null;
    document.getElementById('logoPreview').style.display = 'none';
    document.getElementById('logoInput').value = '';
    generate();
  });
}

async function setupExports() {
  document.getElementById('exportPng').addEventListener('click', async () => {
    const canvas = document.getElementById('qrCanvas');
    if (!currentText || !canvas.classList.contains('visible')) return;
    const dataUrl = canvas.toDataURL('image/png');
    await window.electronAPI.savePNG({ dataUrl, fileName: 'qrcode.png' });
  });

  document.getElementById('exportSvg').addEventListener('click', async () => {
    if (!currentText) return;
    const options = getOptions();
    try {
      const result = await window.electronAPI.generateQR(currentText, { errorLevel: options.errorLevel });
      if (result.error) return;
      const svgContent = renderer.renderSVG(result.modules, options);
      await window.electronAPI.saveSVG({ svgContent, fileName: 'qrcode.svg' });
    } catch (e) {
      console.error('SVG export failed:', e);
    }
  });
}

function setupAbout() {
  const modal = document.getElementById('aboutModal');
  const btn = document.getElementById('aboutBtn');
  const close = document.getElementById('closeAbout');

  btn.addEventListener('click', () => { modal.style.display = 'flex'; });
  close.addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('qrCanvas');
  renderer = new QRRenderer(canvas);

  setupControls();
  setupExports();
  setupAbout();

  generate();
});
