"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";
import { ItemCard } from "~~/components/ItemCard";

const MyItemCardWrapper = ({ itemId, userAddress }: { itemId: bigint, userAddress: string }) => {
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
  if (item.creator.toLowerCase() !== userAddress.toLowerCase()) return null;

  return <ItemCard itemId={itemId} />;
};

const MyItemsPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  const { data: itemCountData, isLoading: isLoadingCount } = useScaffoldReadContract({
    contractName: "MonadFind",
    functionName: "getItemCount",
  });

  const itemCount = itemCountData ? Number(itemCountData) : 0;
  const itemIds = Array.from({ length: itemCount }, (_, i) => BigInt(itemCount - i));

  return (
    <div className="min-h-screen bg-base-100 py-24 px-5 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-16 border-b border-base-200 pb-10">
          <h1 className="text-5xl font-black tracking-tight mb-4">My Escrows</h1>
          <p className="text-2xl text-base-content/60 font-medium">
            Manage the bounties you have securely escrowed on Monad Testnet.
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-warning/10 border border-warning/20 rounded-[2rem] p-16 text-center shadow-lg max-w-3xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-warning mb-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <h3 className="text-4xl font-extrabold mb-4 text-warning">Wallet Disconnected</h3>
            <p className="text-base-content/70 mb-8 text-xl font-medium">Please connect your wallet to view your active bounties.</p>
          </div>
        ) : isLoadingCount ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4 w-full">
                <div className="skeleton h-72 w-full rounded-3xl bg-base-300/50"></div>
              </div>
            ))}
          </div>
        ) : itemCount === 0 ? (
          <div className="bg-base-200/50 border border-base-300 rounded-[2.5rem] p-20 text-center shadow-inner max-w-4xl mx-auto">
            <h3 className="text-4xl font-extrabold mb-6">No active escrows</h3>
            <p className="text-base-content/60 mb-10 text-xl max-w-xl mx-auto font-medium">You haven&apos;t reported any lost items on the network yet.</p>
            <Link href="/create" className="btn btn-primary btn-lg rounded-full px-12 h-16 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all text-lg font-bold">
              Escrow a Reward
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itemIds.map((id) => (
              <MyItemCardWrapper key={id.toString()} itemId={id} userAddress={connectedAddress as string} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItemsPage;
