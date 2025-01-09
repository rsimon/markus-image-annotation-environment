import { useEffect, useState } from 'react';
import { parseIIIF } from '../lib';
import { IIIFParseResult } from '../lib/Types';
import { useStore } from '@/store';

export const useIIIFResource = (id: string) => {

  const store = useStore();

  const [resource, setResource] = useState<IIIFParseResult | undefined>();
  
  useEffect(() => {
    if (!store || !id) return;

    const resource = store.getIIIFResource(id);
    if (!resource) {
      console.warn(`IIIF resource ${id} not found`);
      return;
    }

    fetch(resource.uri)
      .then(res => res.json())
      .then(data => {
        const { error, result } = parseIIIF(data);
        if (error || !result) {
          console.error(error);
        } else {
          setResource(result);
        }
      });
  
  }, [store, id]);

  return resource;
  
}