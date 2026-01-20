export default function CEOPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 font-sans relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <main className="relative flex min-h-screen w-full max-w-5xl mx-auto flex-col items-center justify-start py-16 px-8 z-10">
        <div className="w-full">
          {/* Glowing title */}
          <h1 className="text-6xl font-bold leading-tight tracking-tight mb-8 bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(196,181,253,0.5)]">
            CEO
          </h1>
          
          {/* Content cards with glassmorphism effect */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-purple-900/30 border border-purple-500/30 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(147,51,234,0.3)] hover:border-purple-400/50 transition-all duration-300">
              <h2 className="text-2xl font-semibold text-purple-200 mb-4 tracking-wide">
                Leadership & Vision
              </h2>
              <p className="text-lg leading-8 text-purple-100/90">
                Welcome to the CEO page. This is where you can find information
                about our leadership and vision for the future.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-indigo-900/30 border border-indigo-500/30 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] hover:border-indigo-400/50 transition-all duration-300">
              <h2 className="text-2xl font-semibold text-indigo-200 mb-4 tracking-wide">
                Innovation Forward
              </h2>
              <p className="text-lg leading-8 text-indigo-100/90">
                This page is currently under development. More content will be
                added soon as we continue to innovate and grow.
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex gap-4">
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-transparent rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-300 to-transparent rounded-full"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
