import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';
import { Store } from '@/store/Store';
import { CreateEntity } from './CreateEntity';
import { Entity } from '@/store/Vocabulary';
import { EntityActions } from './EntityActions';
import { getRandomColor } from '../ColorPalette';

export const EntitiesTab = (props: { store: Store }) => {

  const { vocabulary } = props.store;

  const [entities, setEntities] = useState<Entity[]>(vocabulary.entities);

  const onCreateEntity = (e: Entity) => {
    vocabulary.addEntity(e);
    setEntities(vocabulary.entities);
  }

  return (
    <>
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead className="w-[100px]">Label</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Parent ID</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {entities.map(e => (
              <TableRow>
                <TableCell>
                  <span className="pip" style={{ backgroundColor: getRandomColor() }} />
                </TableCell>
                <TableCell className="font-medium">{e.label}</TableCell>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.parentId}</TableCell>
                <TableCell>{e.notes}</TableCell>
                <TableCell className="text-right">
                  <EntityActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex mt-4">
        <CreateEntity 
          onCreate={onCreateEntity} />
      </div>
    </>
  )

}