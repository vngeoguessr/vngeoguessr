"use client";

import { Suspense } from 'react';
import GameClient from '../components/GameClient';

function GameClientWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    }>
      <GameClient />
    </Suspense>
  );
}

export default function GamePage() {
  return <GameClientWithSuspense />;
}