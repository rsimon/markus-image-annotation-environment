import { useState } from 'react';
import { CaseSensitive, Hash, Link2, List, MapPin } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { PropertyDefinitionStub } from './PropertyDefinitionStub';
import { PropertyPreview } from './PropertyPreview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { EnumPropertyDefinition } from './EnumPropertyDefinition';

interface PropertyDefinitionEditorProps {

  property?: PropertyDefinition;

  onSave(definition: PropertyDefinition): void;

}

export const PropertyDefinitionEditor = (props: PropertyDefinitionEditorProps) => {

  const [edited, setEdited] = useState<PropertyDefinitionStub>(props.property || {});

  const onAddOption = (option: string) => 
    setEdited(prop => ({
      ...prop, 
      values: [ ...(prop.values || []),  option].slice().sort()
    }));
  
  const onRemoveOption = (option: string) => () =>
    setEdited(prop => ({
      ...prop, 
      values: (prop.values || []).filter(o => o !== option)
    }));

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const { name, type } = edited;

    // Validate
    if (name && type) {
      props.onSave(edited as PropertyDefinition);
    } else {
      // TODO error handling
    }
  }

  return (
    <article className="grid grid-cols-2 rounded-lg overflow-hidden">
      <div className="px-6 py-3">
        <h3 className="font-semibold mt-1">Property</h3>

        <p className="text-left text-xs leading-relaxed mt-1">
          Use Properties to record specific details in your annotations,
          such as weight, material, age, etc. 
        </p>
        <form onSubmit={onSubmit}>
          <div className="mt-2">
            <Label 
              htmlFor="name"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Name
            </Label>

            <Input 
              id="name" 
              className="h-9"
              value={edited.name || ''} 
              onChange={evt => setEdited(prop => ({ ...prop, name: evt.target.value }))} />
          </div>

          <div className="mt-2">
            <Label 
              htmlFor="type"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Data Type
            </Label>

            <Select
              value={edited.type}
              onValueChange={t => setEdited(prop => ({ ...prop, type: t as PropertyDefinition['type']}))}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="text">
                  <CaseSensitive className="inline w-4 h-4 mr-0.5" /> Text
                </SelectItem>
                <SelectItem value="number">
                  <Hash className="inline w-3 h-3 mr-1 mb-0.5" /> Number
                </SelectItem>
                <SelectItem value="enum">
                  <List className="inline w-3 h-3 mr-1 mb-0.5" /> Options
                </SelectItem>
                <SelectItem value="uri">
                  <Link2 className="inline w-3 h-3 mr-1 mb-0.5" /> URI
                </SelectItem>
                <SelectItem value="geocoordinate">
                  <MapPin className="inline w-3 h-3 mr-1 mb-0.5" /> Geo-coordinate
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {edited.type === 'enum' && (
            <EnumPropertyDefinition 
              definition={edited}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption} />
          )}

          <div className="mt-2">
            <Label 
              htmlFor="description"
              className="inline-block text-xs mb-1.5 ml-0.5">Description</Label>

            <Textarea 
              id="description"
              rows={3} 
              value={edited.description || ''} 
              onChange={evt => setEdited(prop => ({ ...prop, description: evt.target.value }))} />
          </div>

          <div className="mt-5 mb-3 sm:justify-start">
            <Button type="button" onClick={onSubmit}>Save</Button>
          </div>
        </form>
      </div>

      <PropertyPreview property={edited} />
    </article>
  )

}