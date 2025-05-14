'use client';
import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImageModal from './ImageModal';
import { getUserId } from '@/lib/auth';

// Fetch community content from API
async function fetchCommunityItems(page = 1, pageSize = 8) {
  try {
    const res = await fetch(`/api/community?page=${page}&pageSize=${pageSize}`);

    if (!res.ok) {
      throw new Error('Failed to fetch community items');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching community data:', error);
    throw error;
  }
}

// Like a community item
async function likeItem(id) {
  try {
    // Get the persistent client-side user ID
    const userId = getUserId();

    const res = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: id,
        user_id: userId,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to like item');
    }

    return res.json();
  } catch (error) {
    console.error('Error liking item:', error);
    throw error;
  }
}

// Community Item Component
const CommunityItem = ({
  id,
  type,
  title,
  content,
  username,
  likes,
  index,
  onLike,
  onClick,
  hasLiked,
}) => {
  // Handle click on the like button
  const handleLike = (e) => {
    e.stopPropagation(); // Prevent triggering parent click
    onLike(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className='group relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10 hover:border-pink-500/50 transition-all duration-300 cursor-pointer'
      onClick={() =>
        onClick({
          id,
          type,
          title,
          content,
          username,
          likes,
          prompt: 'Prompt not available',
        })
      }>
      {type === 'image' ? (
        <div className='aspect-square'>
          <img
            src={
              content ||
              `https://via.placeholder.com/300x300/1a1a1a/ffffff?text=${title}`
            }
            alt={title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          />
        </div>
      ) : (
        <div className='aspect-square p-4 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/40'>
          <p className='text-white/80 text-sm line-clamp-6 text-center italic'>
            &ldquo;{content || title}&rdquo;
          </p>
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3'>
        <p className='text-white font-medium text-sm'>{title}</p>
        <div className='flex justify-between items-center mt-1'>
          <p className='text-white/70 text-xs'>@{username}</p>
          <button
            className={`flex items-center gap-1 hover:scale-110 transition ${
              hasLiked ? 'text-pink-400' : 'text-white/70'
            }`}
            onClick={handleLike}>
            <Heart
              className={`h-3 w-3 ${
                hasLiked ? 'text-pink-500' : 'text-white/70'
              }`}
              fill={hasLiked ? '#ec4899' : 'none'}
            />
            <span className='text-white/70 text-xs'>{likes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunitySection() {
  const [page, setPage] = useState(1);
  const [likedItems, setLikedItems] = useState({}); // Track liked status
  const [localLikes, setLocalLikes] = useState({}); // Track optimistic like count adjustments
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likesInProgress, setLikesInProgress] = useState({}); // Track in-progress like operations
  const queryClient = useQueryClient();

  // Load liked state from localStorage on component mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedItems');
    if (savedLikes) {
      try {
        setLikedItems(JSON.parse(savedLikes));
      } catch (error) {
        console.error('Error parsing saved likes:', error);
      }
    }
  }, []);

  // Save liked state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedItems', JSON.stringify(likedItems));
  }, [likedItems]);

  // Fetch community data with React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['community', page],
    queryFn: async () => {
      const result = await fetchCommunityItems(page);
      // console.log('API RESPONSE:', result);
      return result;
    },
    // Remove placeholderData so we don't fall back to mock data
    staleTime: 60000, // 1 minute
  });

  // Reset local likes when data changes (after refetch)
  useEffect(() => {
    if (data?.items) {
      setLocalLikes({});
    }
  }, [data]);

  // Handle liking/unliking an item
  const handleLike = async (id) => {
    // Prevent multiple simultaneous like operations on the same item
    if (likesInProgress[id]) return;

    try {
      // Mark this like operation as in progress
      setLikesInProgress((prev) => ({
        ...prev,
        [id]: true,
      }));

      // Get current liked state
      const isCurrentlyLiked = likedItems[id] || false;

      // Optimistic update for UI
      setLikedItems((prev) => ({
        ...prev,
        [id]: !isCurrentlyLiked,
      }));

      // Optimistic update for like count
      setLocalLikes((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + (isCurrentlyLiked ? -1 : 1),
      }));

      // Call the like API
      const response = await likeItem(id);

      // Instead of refetching, use the count from the API
      if (response.count !== undefined) {
        // Find the item and update its like count directly
        const itemIndex = data.items.findIndex((item) => item.id === id);
        if (itemIndex >= 0) {
          // Create a shallow copy of the data object
          const updatedItems = [...data.items];

          // Update the likes count with the server value
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            likes: response.count,
          };

          // Update the data reference by using the React Query setQueryData
          // This is a cleaner way to update the cache without a full refetch
          queryClient.setQueryData(['community', page], (old) => ({
            ...old,
            items: updatedItems,
          }));

          // Reset local likes adjustment since we have the true value now
          setLocalLikes((prev) => ({
            ...prev,
            [id]: 0,
          }));

          // Update the selected item if it's the one we just liked
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem({
              ...selectedItem,
              likes: response.count,
            });
          }
        }
      }

      // If the API response doesn't match our optimistic update,
      // revert to the actual state from the server
      if (response.liked !== !isCurrentlyLiked) {
        setLikedItems((prev) => ({
          ...prev,
          [id]: response.liked,
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);

      // Revert optimistic updates if there was an error
      setLikedItems((prev) => ({
        ...prev,
        [id]: likedItems[id] || false,
      }));

      setLocalLikes((prev) => ({
        ...prev,
        [id]: 0,
      }));
    } finally {
      // Mark like operation as completed
      setLikesInProgress((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  // Open modal with selected item
  const handleItemClick = (item) => {
    // Find the latest item data from the fetched data
    const latestItemData = data.items.find((i) => i.id === item.id) || item;

    setSelectedItem(latestItemData);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Calculate like count - during transitions, we use localLikes for optimistic updates
  const getLikeCount = (item) => {
    if (!item) return 0;

    const backendLikes = item.likes || 0;
    const adjustment = localLikes[item.id] || 0;

    return Math.max(0, backendLikes + adjustment);
  };
  return (
    <div className='mt-24'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300'>
          Community Creations
        </h2>
        <p className='text-white/70 max-w-2xl mx-auto'>
          Explore what others have created with our AI. Get inspired and share
          your own creations with the community.
        </p>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center py-20'>
          <Loader2 className='h-8 w-8 text-pink-500 animate-spin' />
        </div>
      ) : isError ? (
        <div className='text-center py-8 text-pink-500'>
          <p>Error loading community content: {error?.message}</p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
            {data?.items?.map((item, index) => (
              <CommunityItem
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                content={item.content}
                username={item.username}
                likes={getLikeCount(item)}
                index={index}
                onLike={handleLike}
                onClick={handleItemClick}
                hasLiked={likedItems[item.id] || false}
              />
            ))}
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
              <button
                className='px-4 py-2 rounded-md bg-purple-900/50 text-white disabled:opacity-50'
                disabled={page * data?.pageSize >= data?.total}
                onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}

          {/* Full-screen image modal */}
          <ImageModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={selectedItem}
            onLike={handleLike}
            hasLiked={
              selectedItem ? likedItems[selectedItem.id] || false : false
            }
          />
        </>
      )}
    </div>
  );
}
