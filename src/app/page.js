import AnimatedHeader from './components/AnimatedHeader';
import CommunitySection from './components/CommunitySection';
import MainTabs from './components/MainTabs';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-black text-white overflow-hidden'>
      {/* Background elements */}
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0'></div>
      <div className='fixed inset-0 bg-grid-pattern opacity-30 z-0'></div>

      <div className='relative z-10 flex flex-col items-center'>
        {/* Animated Header */}
        <AnimatedHeader />

        <div className='container max-w-7xl mx-auto px-4 pb-20'>
          {/* Main Tabs */}
          <MainTabs />
          {/* Community Section */}
          <CommunitySection />
        </div>
      </div>
    </main>
  );
}
