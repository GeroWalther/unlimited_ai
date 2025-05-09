'use client';
import { motion } from 'framer-motion';

// Animated Header Component
export default function AnimatedHeader() {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 relative overflow-hidden flex justify-center items-center'>
      <div className='container max-w-4xl mx-auto flex justify-center items-center'>
        <h1 className='flex flex-col items-center justify-center font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-center w-full'>
          <motion.span
            className='gradient-text gradient-1'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}>
            Create.
          </motion.span>
          <motion.span
            className='gradient-text gradient-2'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              type: 'spring',
              stiffness: 50,
            }}>
            Imagine.
          </motion.span>
          <motion.span
            className='gradient-text gradient-3'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              type: 'spring',
              stiffness: 50,
            }}>
            Inspire.
          </motion.span>
        </h1>
      </div>
    </section>
  );
}
