'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      toastStyle={{
        borderRadius: '12px',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        fontSize: '14px',
        fontWeight: 500,
      }}
    />
  );
}
