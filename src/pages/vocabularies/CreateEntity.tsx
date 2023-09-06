import { useFormik } from 'formik';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Textarea } from '@/components/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';

export const CreateEntity = () => {

  const formik = useFormik({
    initialValues: {
      name: '',
      id: '',
      notes: ''
    },

    onSubmit: ({ name, id, notes }) => {
      console.log('submit', name, id, notes);
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4">
          Create New Entity
        </Button>
      </DialogTrigger>

      <DialogContent>
      <DialogHeader>
          <DialogTitle>Create New Entity</DialogTitle>
          <DialogDescription>
            Create a new semantic entity for use in image annotations. Click save when you are done.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label 
              htmlFor="name" 
              className="text-right">
              Name
            </Label>

            <Input 
              id="name" 
              className="col-span-3" 
              value={formik.values.name} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label 
              htmlFor="id" 
              className="text-right">
              ID
            </Label>

            <Input 
              id="id" 
              className="col-span-3" 
              value={formik.values.id} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label 
              htmlFor="notes" 
              className="text-right">
              Notes
            </Label>

            <Textarea 
              id="notes" 
              className="col-span-3" 
              rows={5}
              value={formik.values.notes} 
              onChange={formik.handleChange} />
          </div>

          <DialogFooter>
            <Button type="submit">Save Entity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

}