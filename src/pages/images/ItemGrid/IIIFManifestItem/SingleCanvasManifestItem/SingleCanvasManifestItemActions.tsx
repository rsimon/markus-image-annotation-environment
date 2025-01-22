import { useState } from 'react';
import { Images, MoreVertical, NotebookPen, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface SingleCanvasManifestItemActionsProps {

    canvas: CanvasInformation;
  
    onDelete(): void;
  
    onSelect(): void;

}

export const SingleCanvasManifestItemActions = (props: SingleCanvasManifestItemActionsProps) => {

  const { canvas } = props;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const url = `/annotate/iiif:${canvas.manifestId}:${canvas.id}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="item-actions-trigger absolute bottom-2 right-1">
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={props.onSelect}>
            <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to={url}>
              <Images className="size-4 text-muted-foreground mr-2" /> Open Canvas
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
              <Trash2 className="size-4 mr-2 mb-[1px] text-red-700/70" />
              <span className="text-red-700 hover:text-red-700">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message="This will remove the manifest and will permanently delete all annotations from your computer."
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}