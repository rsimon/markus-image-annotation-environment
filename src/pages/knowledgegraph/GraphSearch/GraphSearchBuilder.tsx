import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { Grip, Plus, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { GraphSearchConditionBuilder } from './GraphSearchConditionBuilder';
import { Condition, ObjectType, Sentence } from './Types';
import { GraphNode, KnowledgeGraphSettings } from '../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchBuilderProps {

  settings: KnowledgeGraphSettings;

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onClose(): void;

}

export const GraphSearchBuilder = (props: GraphSearchBuilderProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [objectType, setObjectType] = useState<ObjectType | undefined>();

  const [conditions, setConditions] = useState<Condition[]>([]);

  const EMPTY_CONDITION: Condition = objectType === 'IMAGE'
    ? { sentence: { ConditionType: 'WHERE' } } : { sentence: {} };

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  useEffect(() => {
    if (objectType) {
      setConditions([{...EMPTY_CONDITION}]);
    } else {
      setConditions([]);
    }
  }, [objectType]);

  useEffect(() => {
    const hasMatches = conditions.length > 0 && conditions.every(c => Boolean(c.matches));
    if (!hasMatches || !objectType) {
      props.onChangeQuery(undefined)
    } else {
      // For now, we keep all conditions AND-connected, which means
      // the total matches are the intersection of all individual matches
      const intersection = new Set(conditions.reduce((intersected, { matches }) => {
        return intersected.filter(str => matches.includes(str));
      }, conditions[0].matches!));

      const query = (n: GraphNode) =>
        n.type === objectType && intersection.has(n.id);

      console.log(`Query: type=${objectType}, ids`, intersection);

      props.onChangeQuery(query);
  }
  }, [conditions]);

  const isComplete = (sentence: Partial<Sentence>) => {
    if (!sentence.ConditionType || !sentence.Value) return false;

    if ('Attribute' in sentence) {
      // SimpleConditionSentence
      return sentence.Attribute && sentence.Comparator;
    } else {
      // NestedConditionSentence
      return false; // TODO
    }
  }
  
  const onChange = (current: Partial<Sentence>, next: Partial<Sentence>, matches?: string[]) => {
    setConditions(c => c.map(condition => 
      condition.sentence === current ? ({ sentence : next, matches }) : condition));
  }

  const onDelete = (sentence: Partial<Sentence>) => {
    const next = conditions.filter(c => c.sentence !== sentence);

    setConditions(next);

    if (next.length === 0)
      setObjectType(undefined);
  }

  return (
    <div 
      ref={el}
      className="bg-white min-w-[510px] min-h-[180px] backdrop-blur-sm border absolute top-6 left-6 rounded shadow-lg z-30">
    
      <div className="flex justify-between items-center pl-2 pr-1 py-1 border-b cursor-move mb-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Grip className="w-4 h-4 mb-0.5" />
          <span>Graph Search</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="p-0 h-auto w-auto"
          onClick={props.onClose}>
          <X className="h-8 w-8 p-2" />
        </Button>
      </div>

      <div className="p-2 pr-6 pb-8">
        <div className="text-xs flex items-center gap-2">
          <span className="w-12 text-right">
            Find
          </span> 
          
          <Select 
            value={objectType || ''}
            onValueChange={value => setObjectType(value as ObjectType)}>
            
            <SelectTrigger className="rounded-none px-2 py-1 h-auto bg-white shadow-none">
              <span className="text-xs">
                <SelectValue placeholder="select node type..." />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem
                className="text-xs" 
                value="IMAGE">images</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {conditions.map(({ sentence }, idx) => (
          <div 
            className="flex flex-nowrap gap-2 pt-2 text-xs items-center"
            key={idx}>
            
            {(idx === 0) ? (
              <div className="w-12" />
            ) : (
              <div className="w-12 text-right">and</div>
            )}

            <GraphSearchConditionBuilder 
              sentence={sentence}
              onChange={(next, matches) => onChange(sentence, next, matches)}
              onDelete={() => onDelete(sentence)} />
          </div>
        ))}

        {(conditions.length > 0 && isComplete(conditions[conditions.length - 1].sentence)) && (
          <div className="flex justify-start pt-2 pl-14 pr-2">
            <Button 
              disabled={!conditions.map(c => c.sentence).every(isComplete)}
              variant="link"
              size="sm"
              className="flex items-center text-xs py-0 px-0"
              onClick={() => setConditions(conditions => ([...conditions, {...EMPTY_CONDITION}]))}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Condition
            </Button>
          </div>
        )}
      </div>
    </div>
  )

}