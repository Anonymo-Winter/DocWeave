import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <Toaster position='top-left' richColors closeButton visibleToasts={5} expand={true} />
                <App />
            </BrowserRouter>
        </PersistGate>
    </Provider>,
);
