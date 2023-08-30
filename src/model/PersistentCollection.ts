import { AnnotatedImage } from './AnnotatedImage';

export interface PersistentCollection {

  name: string;

  images: AnnotatedImage[];

  handle: FileSystemDirectoryHandle;

}