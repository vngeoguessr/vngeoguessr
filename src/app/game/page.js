"use client";

import { Suspense } from 'react';
import GameClient from '../components/GameClient';

function GameClientWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-2xl">Loading game...</div>
      </div>
    }>
      <GameClient />
    </Suspense>
  );
}

export default function GamePage() {
  return <GameClientWithSuspense />;
}