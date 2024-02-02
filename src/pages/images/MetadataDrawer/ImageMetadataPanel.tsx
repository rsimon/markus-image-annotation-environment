import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dequal } from 'dequal/lite';
import { ImageMetadataSchema, PropertyDefinition } from '@/model';
import { useDataModel, useImageMetadata } from '@/store';
import { ImageGridItem } from '../ItemGrid';
import { 
  EnumField, 
  ExternalAuthorityField, 
  GeoCoordinateField, 
  MeasurementField, 
  NumberField, 
  PropertyValidation, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';
import { Button } from '@/ui/Button';
import { PanelTop, ToyBrick } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';

interface ImageMetadataPanelProps {

  image: ImageGridItem;

}

const parseBody = (body: W3CAnnotationBody, schema: ImageMetadataSchema) => {
  if (schema && body && 'properties' in body) {
    const entries = (schema.properties || []).map(definition => (
      [definition.name, body.properties[definition.name]]
    )).filter(t => Boolean(t[1]));

    return Object.fromEntries(entries);
  } else {
    return {};
  }
}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const navigate = useNavigate();

  const model = useDataModel();

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const schema = metadata 
    ? model.getImageSchema(metadata.source || 'default') 
    : model.getImageSchema('default');

  const [formState, setFormState] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (metadata && schema) {
      const values = parseBody(metadata, schema);
      setFormState(values);    
    } 
  }, [schema, metadata]);

  const hasChanges = schema && !dequal(formState, parseBody(metadata, schema));

  const getValue = (definition: PropertyDefinition) => formState[definition.name];

  const onChange = (definition: PropertyDefinition, value: any) =>
    setFormState(s => {
      const next = {...s};

      if (value) {
        next[definition.name] = value;
      } else {
        delete next[definition.name];
      }

      return next;
    });

  const onSave = () => {
    const next = {
      ...metadata,
      properties: formState
    };

    updateMetadata(next);
  }

  const onOpen = () => navigate(`/annotate/${props.image.id}`);

  return (
    <PropertyValidation>
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col flex-grow">
          <h2 className="leading-relaxed mr-5 mb-8 font-medium">
            {props.image.name}
          </h2>
          {Boolean(schema) ? (
            <ul>
              {(schema.properties || []).map(definition => (
                <div className="mt-2" key={definition.name}>
                  {definition.type === 'enum' ? (
                    <EnumField
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'external_authority' ? (
                    <ExternalAuthorityField
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'geocoordinate' ? (
                    <GeoCoordinateField
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'measurement' ? (
                    <MeasurementField
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'number' ? (
                    <NumberField
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'text' ? (
                    <TextField 
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : definition.type === 'uri' ? (
                    <URIField 
                      id={definition.name}
                      definition={definition} 
                      value={getValue(definition)}
                      onChange={value => onChange(definition, value)} />
                  ) : null }
                </div>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col text-sm items-center px-2 justify-center text-center flex-grow leading-loose text-muted-foreground">
              <span>
                No image metadata model.<br/>
                Go to <Link to="/model" className="inline-block text-black hover:bg-muted px-1 rounded-sm"><ToyBrick className="inline h-4 w-4 align-text-top" /> Data Model</Link> to 
                define one.
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 pb-4">
          {schema && (
            <Button 
              disabled={!hasChanges} 
              className="w-full mb-2"
              onClick={onSave}>
              Save Metadata
            </Button>
          )}

          <Button 
            variant="outline"
            className="w-full"
            onClick={onOpen}>
            <PanelTop className="h-4 w-4 mr-2" /> Open Image
          </Button>
        </div>
      </div>
    </PropertyValidation>
  )

}