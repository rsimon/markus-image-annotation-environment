import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { cn } from '@/ui/utils';

interface MetadataDrawerProps <T extends unknown>{

  className?: string;

  content: (data: T) => ReactNode;

  data?: T;

  duration?: number;

  width?: number;

  onClose(): void;

}

export const Drawer = <T extends unknown>(props: MetadataDrawerProps<T>) => {

  const width = props.width || 340;

  const previous = useRef<T | undefined>();

  const shouldAnimate = 
    // Drawer currently closed, and should open
    !previous.current && props.data ||
    // Drawer currently open, and should close
    previous.current && !props.data;

  const transition = useTransition([props.data], {
    from: { flexBasis: 0, width: 0 },
    enter: { flexBasis: width, width },
    leave: { flexBasis: 0, width: 0 },
    config:{
      duration: shouldAnimate ? props.duration || 150 : 0,
      easing: easings.easeInCubic
    }
  });

  useEffect(() => {
    previous.current = props.data;
  }, [props.data]);

  const className = cn(props.className, 'flex-grow-0 flex-shrink-0 relative border-l shadow-sm');

  return transition((style, d) => d && (
    <animated.div 
      style={style}
      className={className}>
      <aside className="w-[340px] absolute top-0 left-0 h-full overflow-y-auto box-border">
        <button 
          onClick={props.onClose}
          className="absolute right-2 bg-white/80 top-2 rounded-full z-10 p-1 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="w-6 h-6 p-0.5" />
        </button>

        {props.content(d)}
      </aside>
    </animated.div>
  ))

}