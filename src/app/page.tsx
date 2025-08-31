import { ChefHat } from 'lucide-react';
import { FridgeFeastClient } from '@/components/fridge-feast-client';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8 flex items-center justify-center gap-3">
        <ChefHat className="w-10 h-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
          Fridge Feast
        </h1>
      </header>
      <main className="w-full max-w-2xl">
        <FridgeFeastClient />
      </main>
    </div>
  );
}
