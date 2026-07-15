class QRRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(modules, options) {
    const {
      moduleShape = 'square',
      finderStyle = 'standard',
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      transparentBg = false,
      moduleSize = 10,
      margin = 4,
      logoImage = null,
      logoSize = 0.25
    } = options;

    const size = modules.length;
    const pixelSize = moduleSize;
    const marginPx = margin * pixelSize;
    const canvasSize = size * pixelSize + marginPx * 2;

    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (!transparentBg && backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = modules[y][x];
        const cx = marginPx + x * pixelSize;
        const cy = marginPx + y * pixelSize;
        const isFinder = this._isFinderModule(x, y, size);

        if (isDark) {
          if (isFinder) {
            this._drawFinderModule(x, y, cx, cy, pixelSize, finderStyle, options);
          } else {
            this._drawDataModule(x, y, cx, cy, pixelSize, moduleShape, foregroundColor);
          }
        } else if (!transparentBg && backgroundColor) {
          this._drawDataModule(x, y, cx, cy, pixelSize, 'square', backgroundColor);
        }
      }
    }

    if (logoImage) {
      this._drawLogo(logoImage, canvasSize, logoSize);
    }
  }

  renderSVG(modules, options) {
    const {
      moduleShape = 'square',
      finderStyle = 'standard',
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      transparentBg = false,
      moduleSize = 10,
      margin = 4
    } = options;

    const size = modules.length;
    const pixelSize = moduleSize;
    const marginPx = margin * pixelSize;
    const canvasSize = size * pixelSize + marginPx * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">`;

    if (!transparentBg && backgroundColor) {
      svg += `<rect width="${canvasSize}" height="${canvasSize}" fill="${backgroundColor}"/>`;
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = modules[y][x];
        const cx = marginPx + x * pixelSize;
        const cy = marginPx + y * pixelSize;
        const isFinder = this._isFinderModule(x, y, size);

        if (isDark) {
          if (isFinder) {
            svg += this._svgFinderModule(x, y, cx, cy, pixelSize, finderStyle, options);
          } else {
            svg += this._svgDataModule(cx, cy, pixelSize, moduleShape, foregroundColor);
          }
        } else if (!transparentBg && backgroundColor) {
          svg += this._svgDataModule(cx, cy, pixelSize, 'square', backgroundColor);
        }
      }
    }

    svg += '</svg>';
    return svg;
  }

  _isFinderModule(x, y, size) {
    const topLeft = x < 7 && y < 7;
    const topRight = x >= size - 7 && y < 7;
    const bottomLeft = x < 7 && y >= size - 7;
    return topLeft || topRight || bottomLeft;
  }

  _drawDataModule(x, y, cx, cy, size, shape, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(cx + size / 2, cy + size / 2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'x':
        this._drawX(cx, cy, size, color);
        break;

      case 'plus':
        this._drawPlus(cx, cy, size, color);
        break;

      case 'square':
      default:
        ctx.fillRect(cx, cy, size, size);
        break;
    }
  }

  _drawX(cx, cy, size, color) {
    const ctx = this.ctx;
    const t = size * 0.3;
    const pad = size * 0.15;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + pad, cy + pad);
    ctx.lineTo(cx + pad + t, cy + pad);
    ctx.lineTo(cx + size / 2, cy + size / 2 - t / 2);
    ctx.lineTo(cx + size - pad - t, cy + pad);
    ctx.lineTo(cx + size - pad, cy + pad);
    ctx.lineTo(cx + size / 2 + t / 2, cy + size / 2);
    ctx.lineTo(cx + size - pad, cy + size - pad);
    ctx.lineTo(cx + size - pad - t, cy + size - pad);
    ctx.lineTo(cx + size / 2, cy + size / 2 + t / 2);
    ctx.lineTo(cx + pad + t, cy + size - pad);
    ctx.lineTo(cx + pad, cy + size - pad);
    ctx.lineTo(cx + size / 2 - t / 2, cy + size / 2);
    ctx.closePath();
    ctx.fill();
  }

  _drawPlus(cx, cy, size, color) {
    const ctx = this.ctx;
    const w = size * 0.24;
    const h = size * 0.24;
    ctx.fillStyle = color;
    const cx2 = cx + size / 2;
    const cy2 = cy + size / 2;
    ctx.fillRect(cx2 - h / 2, cy, h, size);
    ctx.fillRect(cx, cy2 - w / 2, size, w);
  }

  _drawFinderModule(x, y, cx, cy, pixelSize, finderStyle, options) {
    const { foregroundColor, backgroundColor, transparentBg } = options;
    const ctx = this.ctx;

    if (finderStyle === 'standard') {
      ctx.fillStyle = foregroundColor;
      ctx.fillRect(cx, cy, pixelSize, pixelSize);
      return;
    }

    const finderPattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];

    const size = pixelSize;
    const r = size / 2;

    const finderX = x % 7;
    const finderY = y % 7;
    const val = finderPattern[finderY][finderX];

    if (!val) {
      if (!transparentBg && backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(cx, cy, size, size);
      }
      return;
    }

    ctx.fillStyle = foregroundColor;

    switch (finderStyle) {
      case 'rounded':
        this._drawRoundedRect(cx, cy, size, size, size * 0.2);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(cx + r, cy + r, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'diamond':
        ctx.save();
        ctx.translate(cx + r, cy + r);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-r * 0.42, -r * 0.42, r * 0.84, r * 0.84);
        ctx.restore();
        break;

      case 'leaf': {
        const ir = r * 0.45;
        ctx.beginPath();
        ctx.arc(cx + r, cy + r - ir * 0.3, ir, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r - ir * 0.3, cy + r + ir * 0.2, ir, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r + ir * 0.3, cy + r + ir * 0.2, ir, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'rounded-outer-sharp-inner': {
        const isOuter = finderY === 0 || finderY === 6 || finderX === 0 || finderX === 6;
        if (isOuter) {
          this._drawRoundedRect(cx, cy, size, size, size * 0.25);
        } else {
          ctx.fillRect(cx, cy, size, size);
        }
        break;
      }

      case 'frame': {
        const isOuterRing = (finderY === 0 || finderY === 6) || (finderX === 0 || finderX === 6);
        const isInnerDark = (finderY >= 2 && finderY <= 4) && (finderX >= 2 && finderX <= 4);
        if (isOuterRing || isInnerDark) {
          ctx.fillRect(cx, cy, size, size);
        }
        break;
      }

      case 'dots': {
        ctx.beginPath();
        ctx.arc(cx + r, cy + r, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default:
        ctx.fillRect(cx, cy, size, size);
    }
  }

  _svgFinderModule(x, y, cx, cy, pixelSize, finderStyle, options) {
    const { foregroundColor, backgroundColor, transparentBg } = options;
    const size = pixelSize;

    const finderPattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];

    const finderX = x % 7;
    const finderY = y % 7;
    const val = finderPattern[finderY][finderX];

    if (!val) {
      if (!transparentBg && backgroundColor) {
        return `<rect x="${cx}" y="${cy}" width="${size}" height="${size}" fill="${backgroundColor}"/>`;
      }
      return '';
    }

    const color = foregroundColor;
    const r = size / 2;

    switch (finderStyle) {
      case 'rounded':
        return `<rect x="${cx}" y="${cy}" width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="${color}"/>`;
      case 'circle':
        return `<circle cx="${cx + r}" cy="${cy + r}" r="${r * 0.42}" fill="${color}"/>`;
      case 'diamond': {
        const hw = r * 0.42;
        return `<rect x="${cx + r - hw * 0.707}" y="${cy + r - hw * 0.707}" width="${hw * 1.414}" height="${hw * 1.414}" transform="rotate(45 ${cx + r} ${cy + r})" fill="${color}"/>`;
      }
      case 'dots':
        return `<circle cx="${cx + r}" cy="${cy + r}" r="${r * 0.35}" fill="${color}"/>`;
      default:
        return `<rect x="${cx}" y="${cy}" width="${size}" height="${size}" fill="${color}"/>`;
    }
  }

  _svgDataModule(cx, cy, size, shape, color) {
    const r = size / 2;

    switch (shape) {
      case 'circle':
        return `<circle cx="${cx + r}" cy="${cy + r}" r="${size * 0.45}" fill="${color}"/>`;
      case 'x': {
        const t = size * 0.3;
        const pad = size * 0.15;
        const pts = [
          `${cx + pad},${cy + pad}`,
          `${cx + pad + t},${cy + pad}`,
          `${cx + size / 2},${cy + size / 2 - t / 2}`,
          `${cx + size - pad - t},${cy + pad}`,
          `${cx + size - pad},${cy + pad}`,
          `${cx + size / 2 + t / 2},${cy + size / 2}`,
          `${cx + size - pad},${cy + size - pad}`,
          `${cx + size - pad - t},${cy + size - pad}`,
          `${cx + size / 2},${cy + size / 2 + t / 2}`,
          `${cx + pad + t},${cy + size - pad}`,
          `${cx + pad},${cy + size - pad}`,
          `${cx + size / 2 - t / 2},${cy + size / 2}`
        ];
        return `<polygon points="${pts.join(' ')}" fill="${color}"/>`;
      }
      case 'plus': {
        const w = size * 0.24;
        const h = size * 0.24;
        const cx2 = cx + r;
        const cy2 = cy + r;
        let s = '';
        s += `<rect x="${cx2 - h / 2}" y="${cy}" width="${h}" height="${size}" fill="${color}"/>`;
        s += `<rect x="${cx}" y="${cy2 - w / 2}" width="${size}" height="${w}" fill="${color}"/>`;
        return s;
      }
      case 'square':
      default:
        return `<rect x="${cx}" y="${cy}" width="${size}" height="${size}" fill="${color}"/>`;
    }
  }

  _roundedRectPath(x, y, w, h, r) {
    const ctx = this.ctx;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _drawRoundedRect(x, y, w, h, r) {
    this._roundedRectPath(x, y, w, h, r);
    this.ctx.fill();
  }

  _drawLogo(image, canvasSize, logoSizeFraction) {
    const ctx = this.ctx;
    const maxDim = canvasSize * logoSizeFraction;
    const imgW = image.width;
    const imgH = image.height;
    const scale = Math.min(maxDim / imgW, maxDim / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (canvasSize - drawW) / 2;
    const drawY = (canvasSize - drawH) / 2;

    ctx.drawImage(image, drawX, drawY, drawW, drawH);
  }
}
