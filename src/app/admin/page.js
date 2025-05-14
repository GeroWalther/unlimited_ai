'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';

// Fetch all creations from API
async function fetchCreations(page = 1, pageSize = 20) {
  try {
    const res = await fetch(
      `/api/admin/creations?page=${page}&pageSize=${pageSize}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch creations');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching creations:', error);
    throw error;
  }
}

// Delete a creation
async function deleteCreation(id) {
  try {
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error('Failed to delete creation');
    }

    return res.json();
  } catch (error) {
    console.error('Error deleting creation:', error);
    throw error;
  }
}

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState({});

  // Fetch creations with React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-creations', page],
    queryFn: () => fetchCreations(page),
    staleTime: 30000, // 30 seconds
  });

  // Handle deletion
  const handleDelete = async (id) => {
    if (
      !confirm(
        'Are you sure you want to delete this item? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting((prev) => ({ ...prev, [id]: true }));
      await deleteCreation(id);
      refetch(); // Refresh the list after deletion
    } catch (error) {
      alert('Failed to delete item: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6'>Admin Dashboard</h1>

      <div className='bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10'>
        <h2 className='text-xl font-semibold mb-4'>All Creations</h2>

        {isLoading ? (
          <div className='flex justify-center items-center py-20'>
            <Loader2 className='h-8 w-8 text-pink-500 animate-spin' />
          </div>
        ) : isError ? (
          <div className='text-center py-8 text-pink-500'>
            <p>Error loading creations: {error?.message}</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead className='bg-gray-800/50'>
                  <tr>
                    <th className='p-2 text-left'>ID</th>
                    <th className='p-2 text-left'>Type</th>
                    <th className='p-2 text-left'>Title</th>
                    <th className='p-2 text-left'>Preview</th>
                    <th className='p-2 text-left'>Username</th>
                    <th className='p-2 text-left'>Created At</th>
                    <th className='p-2 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items?.map((item) => (
                    <tr
                      key={item.id}
                      className='border-t border-gray-700 hover:bg-white/5'>
                      <td className='p-2 truncate max-w-[100px]'>{item.id}</td>
                      <td className='p-2'>{item.type}</td>
                      <td className='p-2 truncate max-w-[150px]'>
                        {item.title}
                      </td>
                      <td className='p-2'>
                        {item.type === 'image' ? (
                          <div className='w-16 h-16 relative bg-gray-900 rounded overflow-hidden'>
                            <Image
                              src={item.content}
                              alt={item.title}
                              fill
                              sizes='64px'
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          <div className='w-16 h-16 bg-gray-900 rounded flex items-center justify-center text-xs overflow-hidden p-1'>
                            {item.content.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className='p-2'>{item.username}</td>
                      <td className='p-2'>
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className='p-2'>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting[item.id]}
                          className='p-2 text-red-500 hover:text-red-300 disabled:opacity-50'>
                          {isDeleting[item.id] ? (
                            <Loader2 className='h-5 w-5 animate-spin' />
                          ) : (
                            <Trash2 className='h-5 w-5' />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.total > data?.pageSize && (
              <div className='flex justify-center mt-8 gap-2'>
                <button
                  className='px-4 py-2 rounded-md bg-purple-900/50 text-white disabled:opacity-50'
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                  Previous
                </button>
                <span className='px-4 py-2'>
                  Page {page} of {Math.ceil(data.total / data.pageSize)}
                </span>
                <button
                  className='px-4 py-2 rounded-md bg-purple-900/50 text-white disabled:opacity-50'
                  disabled={page * data?.pageSize >= data?.total}
                  onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
