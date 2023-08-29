import { Progress } from '@/components/Progress';

import './Loading.css';

interface LoadingProps {

  progress: number;

}

export const Loading = (props: LoadingProps) => {

  return (
    <main className="page start loading">
      <Progress value={props.progress} />
    </main>
  )

}