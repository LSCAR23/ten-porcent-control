'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function SaloneroLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('userName');
    router.push('/');
  };

  return (
    <div>
      <nav className="bg-black text-white py-4 px-6 shadow-lg">
        <div className="flex justify-end items-center max-w-7xl mx-auto">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="mt-6 max-w-7xl mx-auto px-4">{children}</main>
    </div>
  );
}
