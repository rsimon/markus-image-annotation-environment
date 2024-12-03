import { useCallback, useRef } from 'react';
import type { History } from '@annotorious/core';
import { ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';

export const usePersistentHistory = (images: LoadedImage[]) => {

  const historyRefs = useRef<Map<string, History<ImageAnnotation>>>(new Map());

  const onUnmountAnnotator = useCallback((imageId: string) => (history: History<ImageAnnotation>) => {
    historyRefs.current.set(imageId, history);
  }, [images]);

  const getPersistedHistory = useCallback((imageId: string) => (
    historyRefs.current.get(imageId)
  ), []);

  return { onUnmountAnnotator, getPersistedHistory };

}