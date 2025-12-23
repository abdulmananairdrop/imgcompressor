import { init as initJpeg, default as encodeJpeg } from '@jsquash/jpeg/encode';
import { init as initPng, default as encodePng } from '@jsquash/png/encode';
import { init as initWebp, default as encodeWebp } from '@jsquash/webp/encode';
import { init as initAvif, default as encodeAvif } from '@jsquash/avif/encode';
import { fileToImageData } from './imageUtils';

import jpegWasm from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import pngWasm from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url';
import webpWasm from '@jsquash/webp/codec/enc/webp_enc.wasm?url';
import avifWasm from '@jsquash/avif/codec/enc/avif_enc.wasm?url';

let initialized = false;

const initWasm = async () => {
  if (initialized) return;
  
  try {
    await Promise.all([
      initJpeg({ locateFile: () => jpegWasm }),
      initPng(pngWasm),
      initWebp({ locateFile: () => webpWasm }),
      initAvif({ locateFile: () => avifWasm }),
    ]);
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize WASM modules', error);
  }
};

export interface CompressionOptions {
  quality: number;
  width?: number;
  height?: number;
}

export const compressImage = async (file: File, options: CompressionOptions): Promise<Blob> => {
  await initWasm();
  
  let imageData = await fileToImageData(file);

  if (options.width && options.height) {
     if (imageData.width > options.width || imageData.height > options.height) {
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
             const bitmap = await createImageBitmap(file);
             ctx.drawImage(bitmap, 0, 0, options.width, options.height);
             imageData = ctx.getImageData(0, 0, options.width, options.height);
        }
     }
  }

  let buffer: ArrayBuffer;

  switch (file.type) {
    case 'image/jpeg':
    case 'image/jpg':
      buffer = await encodeJpeg(imageData, { quality: options.quality });
      break;
    case 'image/png':
      buffer = await encodePng(imageData); 
      break;
    case 'image/webp':
      buffer = await encodeWebp(imageData, { quality: options.quality });
      break;
    case 'image/avif':
      buffer = await encodeAvif(imageData, { quality: options.quality });
      break;
    default:
      throw new Error(`Unsupported format: ${file.type}`);
  }

  return new Blob([buffer], { type: file.type });
};