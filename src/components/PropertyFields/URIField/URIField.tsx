import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface URIFieldProps {

  id: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const URIField = (props: URIFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const isValidURL = (str: string) => {
    let url: URL;
  
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const isValid = !validate || isValidURL(value);

  return (
    <div className="mb-5">
      <Label 
        htmlFor={id}
        className="text-xs block mt-3 mb-1.5 ml-0.5">
        {definition.name}
      </Label> {definition.required && !value ? (
        <span className="text-xs text-red-600 ml-1">required</span>
      ) : !isValid && (
        <span className="text-xs text-red-600 ml-1">must be a URI</span>
      )}

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value || ''} 
        onChange={evt => onChange(evt.target.value)} />
    </div>
  )

}