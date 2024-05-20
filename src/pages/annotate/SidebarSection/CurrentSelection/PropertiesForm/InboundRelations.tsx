import { useMemo } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ArrowDownToDot, Dot, Minus, MoveLeft, Spline } from 'lucide-react';
import { EntityType } from '@/model';
import { RelatedAnnotation, useDataModel, useRelationGraph } from '@/store';
import { Separator } from '@/ui/Separator';
import { EntityBadge } from '@/components/EntityBadge';

interface InboundRelationsProps {

  schemaBodies: { body: W3CAnnotationBody, entityType: EntityType }[];

}

export const InboundRelations = (props: InboundRelationsProps) => {

  const model = useDataModel();

  const graph = useRelationGraph();

  const related = useMemo(() => {
    if (!graph) return [];

    return props.schemaBodies.reduce<RelatedAnnotation[]>((all, { body, entityType }) => {
      const related = graph.getInboundLinks(entityType.id, (body as any).properties || {});
      return [...all, ...related];
    }, []);
  }, [graph, props.schemaBodies]);

  return related.length > 0 && (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <span>Related</span>
      </h3>

      <div className="mb-4">
        <ul>
          {related.map(r => (
            <li 
              key={r.annotationId}
              className="flex gap-1.5 items-center mb-2">

              <Dot className="h-4 w-4" />

              <MoveLeft className="h-4 w-4" />

              <div className="text-xs italic">
                {r.relationName}
              </div>

              <Minus className="h-4 w-4" />

              <div>
                <EntityBadge entityType={model.getEntityType(r.sourceEntityType)} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Separator />
    </div>
  )

}