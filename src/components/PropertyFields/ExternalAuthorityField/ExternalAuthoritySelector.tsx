import { Search } from 'lucide-react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { IFrameAuthorityDialog } from './dialogs';

interface ExternalAuthoritySelectorProps {

  definition: ExternalAuthorityPropertyDefinition;

}

export const ExternalAuthoritySelector = (props: ExternalAuthoritySelectorProps) => {

  // Just for testing
  const authority = props.definition.authorities?.length > 0 
    ? props.definition.authorities[0] : undefined;

  return authority && (
    <div>
      {authority.type === 'IFRAME' && (
        <IFrameAuthorityDialog authority={authority}>
          <button className="flex items-center hover:bg-slate-200 px-1.5 py-0.5 rounded">
            <Search className="h-3.5 w-3.5 mr-1" />
            {props.definition.authorities[0].name}
          </button>
        </IFrameAuthorityDialog>
      )}
    </div>
  );

}