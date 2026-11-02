import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
        <Dumbbell className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        The gym page or resource you're looking for doesn't exist or has been relocated.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
      >
        <Home className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};
