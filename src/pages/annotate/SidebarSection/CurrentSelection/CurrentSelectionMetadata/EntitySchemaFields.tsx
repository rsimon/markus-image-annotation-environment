import { EntityType } from '@/model';
import { createSafeKeys } from './PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';
import { EntityDetailsDialog } from '@/components/EntityDetails';
import { 
  EnumPropertyField, 
  GeoCoordinatePropertyField, 
  NumberPropertyField, 
  TextPropertyField, 
  URIPropertyField 
} from '@/components/PropertyFields';
import { Button } from '@/ui/Button';

interface EntitySchemaFieldsProps {

  showErrors?: boolean;

  body: W3CAnnotationBody,

  entityType: EntityType;

  safeKeys: ReturnType<typeof createSafeKeys>;

  values: {[key: string]: any};

  onChange(key: string, value: any): void;

}

export const EntitySchemaFields = (props: EntitySchemaFieldsProps) => {

  const { body, entityType, safeKeys } = props;

  const fields = (entityType.properties || [])
    .map(property => ({ 
      property, 
      key: safeKeys.getKey(body, property.name)
    }));
  
  return (
    <div>
      {fields.map(({ property, key }) => (
        <div className="mt-2" key={key}>
          {property.type === 'enum' ? (
            <EnumPropertyField
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'geocoordinate' ? (
            <GeoCoordinatePropertyField
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'number' ? (
            <NumberPropertyField
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'text' ? (
            <TextPropertyField 
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors} 
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'uri' ? (
            <URIPropertyField 
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors} 
              onChange={value => props.onChange(key, value)} />
          ) : null }
        </div>
      ))}

      <div className="flex justify-end -mt-5 -mb-4">
        <EntityDetailsDialog entityType={entityType}>
          <Button 
            type="button"
            variant="link" 
            className="text-xs text-muted-foreground p-0.5">
            Edit Schema</Button>
        </EntityDetailsDialog>
      </div>
    </div>
  )

}