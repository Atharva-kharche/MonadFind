"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import Link from "next/link";

export const ItemCard = ({ itemId }: { itemId: bigint }) => {
  const { data: item, isLoading } = useScaffoldReadContract({
    contractName: "MonadFind",
    functionName: "getItem",
    args: [itemId],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="skeleton h-72 w-full rounded-3xl bg-base-300/50"></div>
      </div>
    );
  }
  
  if (!item) return null;

  const isOpen = item.status === 0;
  
  return (
    <div className="card w-full bg-base-100 shadow-lg border border-base-200 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden group flex flex-col h-full">
      {/* Top Banner Gradient */}
      <div className={`h-3 w-full transition-colors ${isOpen ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-base-300'}`}></div>
      
      <div className="card-body p-8 flex-grow">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="bg-base-200 px-3 py-1 rounded-lg text-xs font-bold text-base-content/60 tracking-wider">
            ID #{item.id.toString()}
          </div>
          {isOpen ? (
            <div className="badge badge-success bg-success/10 text-success border-success/20 font-bold p-3 uppercase tracking-wider text-xs">
              Open Bounty
            </div>
          ) : (
            <div className="badge badge-neutral bg-base-200 text-base-content/50 border-base-300 font-bold p-3 uppercase tracking-wider text-xs">
              Returned
            </div>
          )}
        </div>
        
        <h2 className="card-title text-2xl font-extrabold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        
        <p className="text-base-content/70 line-clamp-3 text-sm mb-6 flex-grow leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto">
          <div className="bg-base-200/50 rounded-2xl p-4 mb-6 border border-base-200">
            <div className="flex justify-between text-sm items-center">
              <span className="text-base-content/60 font-semibold uppercase tracking-wider text-xs">Reward</span>
              <span className={`font-black text-xl ${isOpen ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary' : 'text-base-content/40'}`}>
                {formatEther(item.reward)} MON
              </span>
            </div>
          </div>

          <div className="card-actions w-full">
            <Link href={`/item/${item.id.toString()}`} className={`btn w-full rounded-xl shadow-sm h-14 ${isOpen ? 'btn-primary group-hover:shadow-lg group-hover:shadow-primary/30' : 'btn-outline border-base-300 text-base-content/50 hover:bg-base-200 hover:text-base-content/70 hover:border-base-300'} transition-all`}>
              {isOpen ? 'View & Claim' : 'View Details'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
