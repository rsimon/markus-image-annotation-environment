import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreProgressHandler, Store, loadStore } from './Store';
import { Entity, Relation, TextTag, Vocabulary } from '@/model';

interface StoreContextState {

  store?: Store;

  setStore: React.Dispatch<React.SetStateAction<Store>>;

  vocabulary: Vocabulary;

  setVocabulary: React.Dispatch<React.SetStateAction<Vocabulary>>;

}

const StoreContext = createContext<StoreContextState>(undefined);

interface StoreProviderProps {

  children: ReactNode;

}

export const StoreProvider = (props: StoreProviderProps) => {

  const [store, setStore] = useState<Store | undefined>(undefined);

  const [vocabulary, setVocabulary] = useState<Vocabulary>(undefined);

  return (
    <StoreContext.Provider value={{ store, setStore, vocabulary, setVocabulary }}>
      {props.children}
    </StoreContext.Provider>
  )

}

export const useInitStore = () => {
  const { setStore, setVocabulary } = useContext(StoreContext);

  return (handle: FileSystemDirectoryHandle, onProgress?: StoreProgressHandler) =>
    loadStore(handle, onProgress).then(store => {
      setStore(store);
      setVocabulary(store.vocabulary);
    });
}

export const useStore = (args: { redirect: boolean } = { redirect: false }) => {
  const { store } = useContext(StoreContext);

  const navigate = args.redirect && useNavigate();

  useEffect(() => {
    if (!store && navigate)
      navigate('/');
  }, []);

  return store;
}

export const useVocabulary = () => {

  const { store, vocabulary, setVocabulary } = useContext(StoreContext);

  const setAsync = (p: Promise<void>) =>
    p.then(() => setVocabulary(store.vocabulary));

  const addEntity = (entity: Entity) =>
    setAsync(store.addEntity(entity));

  const updateEntity = (entity: Entity) => 
    setAsync(store.updateEntity(entity));

  const removeEntity = (entityOrId: Entity | string) =>
    setAsync(store.removeEntity(entityOrId));

  const getEntity = (id: string) => 
    vocabulary.entities.find(e => e.id === id);

  const addRelation = (relation: Relation) =>
    setAsync(store.addRelation(relation));

  const updateRelation = (relation: Relation) =>
    setAsync(store.updateRelation(relation));

  const removeRelation = (relationOrId: Relation | string) =>
    setAsync(store.removeRelation(relationOrId));

  const getRelation = (id: string) =>
    vocabulary.relations.find(r => r.id === id);

  const addTag = (tag: TextTag) =>
    setAsync(store.addTag(tag));

  const removeTag = (tag: TextTag) =>
    setAsync(store.removeTag(tag));

  return { 
    vocabulary,
    addEntity,
    updateEntity,
    removeEntity,
    getEntity,
    addRelation,
    updateRelation,
    removeRelation,
    getRelation,
    addTag,
    removeTag
  };

}