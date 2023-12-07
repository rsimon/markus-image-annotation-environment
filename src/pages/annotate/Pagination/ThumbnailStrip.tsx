import { useTransition, animated, easings } from '@react-spring/web';
import { Image, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';

interface ThumbnailStripProps {

  open: boolean;

  image: LoadedImage;

  onSelect(image: Image): void;

}

import './ThumbnailStrip.css';

export const ThumbnailStrip = (props: ThumbnailStripProps) => {

  const store = useStore();

  const { images } = store.getFolderContents(props.image.folder);

  const loadedImages = useImages(images.map(i => i.id)) as LoadedImage[];

  const transitions = useTransition([props.open], {
    from: { maxHeight: 0 },
    enter: { maxHeight: 100 },
    leave: { maxHeight: 0 },
    config:{
      duration: 150,
      easing: easings.easeInCubic
    }
  })

  return transitions((style, open) => open && (
    <animated.section 
      style={style}
      className="thumbnail-strip overflow-hidden absolute bg-white left-0 w-full h-20 top-[100%] z-10 border-b border-b-slate-300/60 border-t">
      {loadedImages.length > 0 && (
        <ol className="flex gap-2 h-full items-center justify-center">
          {loadedImages.map(image => (
            <li key={image.id} className="w-16 h-16" onClick={() => props.onSelect(image)}>
              <img
                loading="lazy"
                src={URL.createObjectURL(image.data)}
                alt={image.name}
                className="h-auto w-auto object-cover aspect-square rounded-sm shadow" />
            </li>
          ))}
        </ol>
      )}
    </animated.section>
  ))

}