import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { DatabaseProvider } from './db';
import { Toaster } from '@/components/Toaster';
import { App } from '@/App.tsx';

import './index.css'

/*
ReactDOM.createRoot(document.getElementById('app')!).render(
  <DatabaseProvider>
    <StoreProvider>
      <HashRouter>       
        <Toaster />
        <App />
      </HashRouter>
    </StoreProvider>
  </DatabaseProvider>
)
*/

ReactDOM.createRoot(document.getElementById('app')!).render(
  <DatabaseProvider>
    <div>Hello World</div>
  </DatabaseProvider>
)
