import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <>
      <div className='container my-6'>{children}</div>
    </>
  );
}
