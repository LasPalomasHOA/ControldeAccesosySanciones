/**
 * Utilidad de compresión client-side para imágenes antes de enviar al servidor/Storage.
 * Reduce drásticamente el peso de las fotografías (de 2-5 MB a 30-60 KB)
 * manteniendo excelente nitidez para credenciales, placas y evidencias.
 */
export async function compressImageClient(
  fileOrDataUrl: File | Blob | string,
  maxDimension: number = 800,
  quality: number = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl: string) => {
      // Si ya es un SVG o URL remota http/https, devolver tal cual
      if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return resolve(dataUrl);
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(dataUrl);
          }

          // Fondo blanco para imágenes transparentes que se convierten
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Preferir WebP para máxima compresión y calidad
          let compressedBase64 = canvas.toDataURL('image/webp', quality);
          if (!compressedBase64.startsWith('data:image/webp')) {
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(compressedBase64);
        } catch (err) {
          console.warn('Fallo compresión en canvas, usando original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else if (fileOrDataUrl instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processDataUrl(result);
        } else {
          reject(new Error('No se pudo leer el archivo de imagen'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      reject(new Error('Tipo de archivo no soportado'));
    }
  });
}
