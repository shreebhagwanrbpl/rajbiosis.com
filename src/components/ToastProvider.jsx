'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 24,
        right: 24,
        zIndex: 99999999,
      }}
      toastOptions={{
        duration: 4500,
        style: {
          background: '#090d16',
          color: '#ffffff',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '12px 18px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '-0.01em',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          maxWidth: '420px',
          lineHeight: '1.4',
        },
        success: {
          duration: 5000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #10b981',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          },
        },
        loading: {
          style: {
            borderLeft: '4px solid #3b82f6',
          },
        },
      }}
    />
  );
}
