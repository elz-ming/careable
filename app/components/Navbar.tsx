import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-semibold text-black dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              Careable
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/ceo"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              CEO
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
