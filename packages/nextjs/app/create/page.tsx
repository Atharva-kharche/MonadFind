"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { parseEther, stringToHex, keccak256 } from "viem";
import { useAccount } from "wagmi";

const CreateItemPage: NextPage = () => {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [reward, setReward] = useState("");
  const [secret, setSecret] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("MonadFind");

  const handleCreate = async () => {
    if (!title || !description || !reward || !secret) {
      alert("Please fill in all required fields.");
      return;
    }

    if (parseFloat(reward) <= 0) {
      alert("Reward must be greater than 0 MON.");
      return;
    }

    try {
      const rewardWei = parseEther(reward);
      const proofBytes32 = stringToHex(secret, { size: 32 });
      const proofHash = keccak256(proofBytes32);

      await writeContractAsync({
        functionName: "createItem",
        args: [title, description, imageUri, proofHash],
        value: rewardWei,
      });

      setTitle("");
      setDescription("");
      setImageUri("");
      setReward("");
      setSecret("");
    } catch (e: any) {
      console.error("Error creating item:", e);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 py-20 px-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Escrow a Bounty</h1>
          <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
            Report a lost item and lock a MON reward in the smart contract. The reward is automatically released when the finder provides your secret proof.
          </p>
        </div>
        
        <div className="bg-base-100 rounded-[2.5rem] shadow-2xl shadow-base-300/50 border border-base-200 p-8 md:p-14">
          {!isConnected && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 mb-10 flex items-center gap-4 shadow-sm">
              <div className="bg-warning/20 p-3 rounded-full text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-warning text-lg">Wallet Disconnected</h4>
                <p className="text-warning/80 text-sm font-medium">Please connect your wallet to interact with the Monad network.</p>
              </div>
            </div>
          )}

          <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold border-b border-base-200 pb-4">1. Item Details</h3>
              
              <div className="form-control">
                <label className="label px-0">
                  <span className="label-text font-bold text-base-content/80 text-base">What did you lose? <span className="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., iPhone 15 Pro, Black Leather Wallet" 
                  className="input input-lg input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all rounded-xl border-base-300 shadow-sm" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isConnected || isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label px-0">
                  <span className="label-text font-bold text-base-content/80 text-base">Description <span className="text-error">*</span></span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-32 bg-base-200/50 focus:bg-base-100 transition-all text-base rounded-xl border-base-300 p-4 leading-relaxed shadow-sm" 
                  placeholder="Provide distinguishing marks, last known location, colors, or context..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isConnected || isPending}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label px-0">
                  <span className="label-text font-bold text-base-content/80 text-base">Image URI <span className="text-base-content/40 font-normal">(Optional)</span></span>
                </label>
                <input 
                  type="url" 
                  placeholder="https://imgur.com/... or ipfs://..." 
                  className="input input-lg input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all rounded-xl border-base-300 shadow-sm" 
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  disabled={!isConnected || isPending}
                />
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <h3 className="text-2xl font-extrabold border-b border-base-200 pb-4">2. Secure the Reward</h3>
              
              <div className="form-control">
                <label className="label px-0">
                  <span className="label-text font-bold text-base-content/80 text-base">Reward Amount <span className="text-error">*</span></span>
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    step="0.0001"
                    min="0.0001"
                    placeholder="0.0" 
                    className="input input-lg input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all rounded-xl border-base-300 pl-6 text-xl font-bold shadow-sm" 
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    disabled={!isConnected || isPending}
                    required
                  />
                  <div className="absolute right-4 flex items-center gap-2">
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-lg">MON</span>
                  </div>
                </div>
                <label className="label px-0 pt-2">
                  <span className="label-text-alt text-base-content/50 font-medium">This amount will be locked in the smart contract until successfully claimed.</span>
                </label>
              </div>

              <div className="form-control mt-4">
                <label className="label px-0">
                  <span className="label-text font-bold text-base-content/80 text-base">Ownership Proof <span className="text-error">*</span></span>
                </label>
                <div className="bg-info/10 border border-info/20 p-5 rounded-xl mb-4 shadow-sm">
                  <h5 className="font-bold text-info flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Zero-Knowledge Security
                  </h5>
                  <p className="text-sm text-info-content/90 font-medium leading-relaxed">
                    Create a secret passphrase or enter a physical serial number (max 31 chars). 
                    We cryptographically hash this locally. <strong>The plain text is NEVER sent to the blockchain.</strong> The finder must enter this exact secret to unlock the reward.
                  </p>
                </div>
                <input 
                  type="password" 
                  maxLength={31}
                  placeholder="e.g., Hidden Serial Number or Passphrase" 
                  className="input input-lg input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all rounded-xl border-base-300 font-mono shadow-sm" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={!isConnected || isPending}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary w-full mt-8 btn-lg rounded-full h-16 shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all text-xl font-bold" 
              disabled={!isConnected || isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-lg"></span>
                  Confirming on Monad...
                </>
              ) : "Escrow Reward & Report Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateItemPage;
