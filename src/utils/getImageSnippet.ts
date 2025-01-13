import { ImageAnnotation, W3CImageAnnotation, W3CImageFormat } from '@annotorious/react';
import { Image, LoadedFileImage, LoadedIIIFImage, LoadedImage } from '@/model';
import { Store } from '@/store';
import Worker from './getImageSnippetWorker?worker';
import { getRegion } from './iiif/lib/helpers';

interface BaseImageSnippet {

  annotation: ImageAnnotation;

  height: number;

  width: number;

}

export interface FileImageSnippet extends BaseImageSnippet {

  data: Uint8Array;

}

export interface IIIFImageSnippet extends BaseImageSnippet {

  src: string;

}

export type ImageSnippet = FileImageSnippet | IIIFImageSnippet;

interface ScheduledSnippet {

  snippet: FileImageSnippet;

  time: Date;

}

const SnippetScheduler = () => {

  // Drop all cached images older than MAX_AGE 
  const MAX_AGE_MS = 2000;

  const cache: Map<string, ScheduledSnippet> = new Map();

  const inProgress: Map<string, Promise<FileImageSnippet>> = new Map();

  const purgeCache = () => {
    [...cache.entries()].forEach(([id, snippet]) => {
      const age = new Date().getTime() - snippet.time.getTime();
      if (age > MAX_AGE_MS) {
        cache.delete(id);
      }
    });
  }

  const getSnippet = (image: LoadedFileImage, annotation: ImageAnnotation): Promise<FileImageSnippet> => {
    const cacheKey = `${image.id}-${annotation.id}`;

    // Already cached?
    if (cache.has(cacheKey))
      return Promise.resolve(cache.get(cacheKey)!.snippet);

    // Already in progress?
    if (inProgress.has(cacheKey))
      return inProgress.get(cacheKey)!;

    // If not, start processing and store the promise
    const snippetPromise = new Promise<FileImageSnippet>((resolve, reject) => {
      const worker = new Worker();

      const messageHandler = (e: MessageEvent) => {
        worker.removeEventListener('message', messageHandler);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          const snippet: FileImageSnippet = e.data.snippet;
          cache.set(cacheKey, { snippet, time: new Date() });
          resolve(snippet);
        }

        inProgress.delete(cacheKey);
      };

      worker.addEventListener('message', messageHandler);

      worker.postMessage({ image, annotation });
    });

    inProgress.set(cacheKey, snippetPromise);

    purgeCache();

    return snippetPromise;
  }

  return {
    getSnippet
  }

}

const scheduler = SnippetScheduler();

// Bit of an ad-hoc test...
const isW3C = (annotation: ImageAnnotation | W3CImageAnnotation): annotation is W3CImageAnnotation =>
  (annotation as W3CImageAnnotation).body !== undefined;

export const getImageSnippet = (
  image: LoadedImage, 
  annotation: ImageAnnotation | W3CImageAnnotation
): Promise<ImageSnippet> => {
  let a: ImageAnnotation;

  if (isW3C(annotation)) {
    const adapter = W3CImageFormat(image.name);
    const { parsed } = adapter.parse(annotation);
    if (!parsed)
      return Promise.reject('Failed to parse annotation');
    
    a = parsed;
  } else {
    a = annotation;
  }

  if (image.id.startsWith('iiif:')) {
    const { bounds } = a.target.selector.geometry;
    const { canvas } = (image as LoadedIIIFImage);
    const src = getRegion(canvas, bounds);

    return Promise.resolve({
      annotation: a,
      height: bounds.maxY - bounds.minY,
      width: bounds.maxX - bounds.minX,
      src
    } as ImageSnippet);
  } else {
    return scheduler.getSnippet(image as LoadedFileImage, a);
  }
}

export const getAnntotationsWithSnippets = (
  image: Image, 
  store: Store
): Promise<{ annotation: W3CImageAnnotation, snippet?: ImageSnippet }[]> =>
  store.loadImage(image.id).then(loaded =>
    store.getAnnotations(image.id, { type: 'image' }).then(annotations => 
      Promise.all(annotations.map(a => {
        const annotation = a as W3CImageAnnotation;
        return getImageSnippet(loaded, annotation)
          .then(snippet => ({ annotation, snippet }))
          .catch(() => ({ annotation }))
      }))
    )
  )