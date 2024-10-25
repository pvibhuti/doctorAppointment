import './App.css';
import React from 'react';
import RouterPage from './routes';
import { Provider } from 'react-redux';
import store, { persistor } from './store/store';
// import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterPage />
        <ToastContainer/>
      </PersistGate>
    </Provider>
  );
}

export default App;