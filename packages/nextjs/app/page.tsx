"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { ItemCard } from "~~/components/ItemCard";

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  const { data: itemCountData, isLoading: isLoadingCount, error } = useScaffoldReadContract({
    contractName: "MonadFind",
    functionName: "getItemCount",
  });

  const itemCount = itemCountData ? Number(itemCountData) : 0;
  
  // Show newest items first (1-indexed mapping for the smart contract)
  const itemIds = Array.from({ length: itemCount }, (_, i) => BigInt(itemCount - i));

  return (
    <>
      <div className="flex items-center flex-col flex-grow bg-base-100">
        {/* Hero Section */}
        <div className="w-full relative overflow-hidden bg-base-100 py-32 px-5 text-center border-b border-base-200 shadow-sm">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 w-[1200px] h-[600px] bg-primary/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
            <div className="badge badge-primary badge-outline mb-6 px-4 py-3 font-semibold uppercase tracking-widest text-sm shadow-sm">Monad Testnet Native</div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-base-content leading-tight">
              Lost something? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">Help bring it home.</span>
            </h1>
            <p className="text-xl md:text-2xl text-base-content/70 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
              A trust-minimized lost-and-found protocol. Securely escrow rewards on-chain and release them instantly with cryptographic proof of ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
              <Link href="/create" className="btn btn-primary btn-lg shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all w-full sm:w-auto rounded-full px-10 h-16 text-lg font-bold">
                Report Lost Item
              </Link>
              <a href="#explore" className="btn btn-outline btn-lg hover:bg-base-200 hover:-translate-y-1 transition-all w-full sm:w-auto rounded-full px-10 h-16 text-lg font-bold border-base-300">
                Browse Lost Items
              </a>
            </div>
            {!isConnected && (
              <div className="mt-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 text-sm font-semibold bg-warning/10 text-warning px-5 py-3 rounded-full border border-warning/20 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Connect your wallet to interact with the protocol
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explore Section */}
        <div id="explore" className="w-full max-w-7xl mx-auto px-5 py-32 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Active Bounties</h2>
              <p className="text-base-content/60 text-xl font-medium">Find these items, prove you found them, and instantly claim the escrowed MON reward.</p>
            </div>
            <div className="bg-base-200 px-6 py-3 rounded-2xl border border-base-300 font-semibold text-base-content/80 shadow-sm">
              Total Items: {isLoadingCount ? "..." : itemCount}
            </div>
          </div>
          
          {isLoadingCount ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-4 w-full">
                  <div className="skeleton h-64 w-full rounded-3xl bg-base-300/50"></div>
                  <div className="skeleton h-6 w-3/4 bg-base-300/50"></div>
                  <div className="skeleton h-4 w-1/2 bg-base-300/50"></div>
                </div>
              ))}
            </div>
          ) : error ? (
             <div className="bg-error/10 rounded-3xl p-16 text-center border border-error/20 max-w-3xl mx-auto shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-6 text-error opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-3xl font-bold mb-4 text-error">Connection Error</h3>
              <p className="text-base-content/70 text-lg">We couldn&apos;t reach the Monad Testnet to fetch the items. Please check your network connection or try switching RPC endpoints.</p>
            </div>
          ) : itemCount === 0 ? (
            <div className="bg-base-200/50 rounded-3xl p-20 text-center border border-base-300 shadow-inner max-w-4xl mx-auto">
              <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-4xl font-extrabold mb-4">No bounties yet</h3>
              <p className="text-base-content/60 mb-10 text-xl max-w-2xl mx-auto font-medium">The protocol is live, but no one has reported a lost item yet. Be the first to secure a reward on-chain.</p>
              <Link href="/create" className="btn btn-primary btn-lg rounded-full px-10 h-16 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                Escrow the First Reward
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {itemIds.map((id) => (
                <ItemCard key={id.toString()} itemId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
