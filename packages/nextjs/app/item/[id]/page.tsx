"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatEther, stringToHex } from "viem";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const itemId = BigInt(params.id);
  const { isConnected } = useAccount();
  const [secret, setSecret] = useState("");
  
  const { data: item, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "MonadFind",
    functionName: "getItem",
    args: [itemId],
  });

  const { writeContractAsync, isPending } = useScaffoldWriteContract("MonadFind");

  const handleClaim = async () => {
    if (!secret) {
      alert("Please enter the ownership proof to claim.");
      return;
    }

    try {
      const proofBytes32 = stringToHex(secret, { size: 32 });
      await writeContractAsync({
        functionName: "claimItem",
        args: [itemId, proofBytes32],
      });
      setSecret("");
      refetch();
    } catch (e: any) {
      console.error("Error claiming item:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-base-100">
        <span className="loading loading-ring loading-lg text-primary w-20 h-20"></span>
        <p className="mt-6 text-base-content/50 font-bold tracking-widest uppercase text-sm animate-pulse">Decrypting On-Chain Data...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center bg-base-100">
        <div className="bg-error/10 text-error p-8 rounded-full mb-8 shadow-lg shadow-error/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-4xl font-black mb-4">Item Not Found</h1>
        <p className="text-base-content/60 text-xl max-w-md mb-10">The requested item does not exist or has been removed from the network.</p>
        <Link href="/" className="btn btn-outline btn-lg rounded-full px-10">
          Return Home
        </Link>
      </div>
    );
  }

  const isOpen = item.status === 0;

  return (
    <div className="min-h-screen bg-base-100 py-16 px-5 relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-base-content/50 hover:text-primary transition-colors font-semibold text-sm tracking-wider uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Explore
          </Link>
        </div>

        <div className="bg-base-100 rounded-[2rem] shadow-2xl shadow-base-300/50 border border-base-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Details */}
          <div className="p-8 lg:p-16 flex-grow lg:w-2/3 border-b lg:border-b-0 lg:border-r border-base-200 relative">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="bg-base-200 px-4 py-2 rounded-xl text-sm font-bold text-base-content/60 tracking-wider">
                ID #{item.id.toString()}
              </div>
              {isOpen ? (
                <div className="badge badge-success bg-success/10 text-success border-success/20 font-bold p-4 uppercase tracking-widest text-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></span>
                  Open Bounty
                </div>
              ) : (
                <div className="badge badge-neutral bg-base-200 text-base-content/50 border-base-300 font-bold p-4 uppercase tracking-widest text-sm shadow-sm">
                  Returned
                </div>
              )}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-8 leading-tight">{item.title}</h1>
            
            <div className="prose prose-lg max-w-none text-base-content/80 mb-12 bg-base-200/40 p-8 rounded-3xl border border-base-200/50 leading-relaxed font-medium">
              <p className="whitespace-pre-wrap">{item.description}</p>
              {item.imageUri && (
                <div className="mt-6 pt-6 border-t border-base-300">
                  <a href={item.imageUri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary transition-colors font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    View Reference Image
                  </a>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-base-200/50 p-6 rounded-2xl border border-base-200">
                <span className="flex items-center gap-2 text-xs text-base-content/50 font-bold mb-3 uppercase tracking-widest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Creator Address
                </span>
                <span className="text-sm font-mono break-all text-base-content/80">{item.creator}</span>
              </div>

              <div className="bg-base-200/50 p-6 rounded-2xl border border-base-200">
                <span className="flex items-center gap-2 text-xs text-base-content/50 font-bold mb-3 uppercase tracking-widest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Date Escrowed
                </span>
                <span className="text-sm font-medium text-base-content/80">
                  {new Date(Number(item.createdAt) * 1000).toLocaleString(undefined, {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              
              <div className="col-span-1 sm:col-span-2 bg-base-200/50 p-6 rounded-2xl border border-base-200">
                <span className="flex items-center gap-2 text-xs text-base-content/50 font-bold mb-3 uppercase tracking-widest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Proof Hash Identifier (On-Chain)
                </span>
                <span className="text-xs font-mono break-all text-base-content/60">
                  {item.proofHash}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Claim & Reward */}
          <div className="p-8 lg:p-16 lg:w-1/3 bg-base-200/30 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="mb-12">
              <span className="block text-sm text-base-content/50 font-bold mb-3 uppercase tracking-widest">Escrowed Reward</span>
              <div className={`text-5xl lg:text-6xl font-black ${isOpen ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary' : 'text-base-content/30'} tracking-tight`}>
                {formatEther(item.reward)} <span className="text-2xl font-bold">MON</span>
              </div>
            </div>

            {isOpen ? (
              <div className="bg-base-100 p-8 rounded-3xl shadow-xl border border-base-200 relative z-10">
                <h3 className="text-2xl font-extrabold mb-2">Claim Reward</h3>
                <p className="text-sm text-base-content/60 mb-6 font-medium">Verify your ownership by providing the secret proof. The smart contract will release the MON instantly.</p>
                
                {!isConnected && (
                  <div className="bg-warning/10 text-warning px-4 py-3 rounded-xl text-sm font-semibold mb-6 border border-warning/20">
                    Connect your wallet to interact.
                  </div>
                )}
                
                <div className="form-control mb-6">
                  <label className="label px-0 pb-3">
                    <span className="label-text font-bold text-base-content/80">Secret Proof</span>
                  </label>
                  <input 
                    type="password"
                    maxLength={31}
                    placeholder="Enter the secret phrase..." 
                    className="input input-lg input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded-xl border-base-300 shadow-sm"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    disabled={!isConnected || isPending}
                  />
                </div>
                
                <button 
                  className="btn btn-primary btn-lg w-full rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all text-base font-bold" 
                  disabled={!isConnected || isPending}
                  onClick={handleClaim}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Validating...
                    </>
                  ) : "Submit Proof & Claim"}
                </button>
              </div>
            ) : (
              <div className="bg-base-100 p-8 rounded-3xl shadow-lg border border-base-200 text-center relative z-10">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black mb-3">Reward Released</h3>
                <p className="text-base-content/60 mb-6 font-medium">This item has been successfully returned and the bounty was paid out.</p>
                
                <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 text-left">
                  <span className="block text-xs text-base-content/50 font-bold mb-2 uppercase tracking-widest">Claimed By</span>
                  <span className="text-sm font-mono break-all text-base-content">{item.claimant}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
