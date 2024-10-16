import { useCallback, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { RelationshipBrowserSuggestion } from './RelationshipBrowserSuggestion';
import { RelationshipBrowserInput } from './RelationshipBrowserInput';
import { RelationshipSearchResult, useRelationshipSearch } from './useRelationshipSearch';
import { Spline } from 'lucide-react';
import { Button } from '@/ui/Button';

interface RelationshipBrowserProps {

  source: ImageAnnotation;

  target?: ImageAnnotation;

  relation: RelationshipType;

  onSelect(relation: RelationshipType): void;

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const [query, setQuery] = useState('');

  const [suggestions, setSuggestions] = useState<RelationshipSearchResult[]>([]);

  const [showNotApplicable, setShowNotApplicable] = useState(false);

  const { search } = useRelationshipSearch(props.source, props.target);

  const onGetSuggestions = useCallback(({ value }: { value: string }) => {   
    const suggestions = search(query);
    setSuggestions(suggestions);
  }, [search]);

  const renderSuggestion = (type: RelationshipSearchResult, { isHighlighted }) => (
    <RelationshipBrowserSuggestion
      type={type} 
      highlighted={isHighlighted} />
  )

  return (
    <div>
      <div>
        <ReactAutosuggest
          alwaysRenderSuggestions
          suggestions={suggestions} 
          getSuggestionValue={suggestion => suggestion.name}
          onSuggestionSelected={(_, { suggestion }) => props.onSelect(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          shouldRenderSuggestions={() => true}
          renderSuggestion={renderSuggestion}
          renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
            <div {...containerProps} key={containerProps.key} className="w-full p-1">
              {children}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center p-6 text-xs bg-muted">
              No applicable types.

              <Button
                size="sm"
                className="text-[11.5px] whitespace-nowrap font-normal text-muted-foreground bg-transparent hover:bg-white h-auto py-0.5 px-2 mt-4 rounded-full"
                variant="outline"
                onClick={() => setShowNotApplicable(true)}>
                3 not applicable
              </Button>
            </div>
          )}
          renderInputComponent={inputProps => (
            <RelationshipBrowserInput 
              {...inputProps} 
              key={'key' in inputProps ? inputProps.key as string : undefined} />
          )}
          inputProps={{
            value: query,
            onChange: (_, { newValue }) => setQuery(newValue)
          }} />
      </div>

      <div className="flex p-1 border-t">
        <Button
          size="sm"
          className="px-1.5 pr-2 py-1 text-xs text-muted-foreground flex gap-1 h-auto"
          variant="ghost">
          <Spline className="h-4 w-4" /> 
          Create {query ? (
            <>Type <span className="font-light border rounded px-1">{query}</span></>
          ) : 'New Type'}
        </Button>
      </div>
    </div>
  )

}