import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from "react-router";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import routers from './routes/routers';

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <AuthProvider>
     <RouterProvider router={routers} />
      <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
  </AuthProvider>
  </StrictMode>,
)
