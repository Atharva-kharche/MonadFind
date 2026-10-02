import React from "react";
import { MonadLogo } from "./assets/MonadLogo";

export const Footer = () => {
  return (
    <footer className="bg-base-200/50 border-t border-base-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">MONAD<span className="text-primary">Find</span></span>
          </div>
          <p className="text-center text-sm text-base-content/70 max-w-md">
            A trust-minimized lost-and-found dApp on Monad where lost-item rewards are escrowed on-chain and released after cryptographic ownership proof verification.
          </p>
          <div className="flex items-center gap-4 text-sm mt-4">
            <span className="text-base-content/60">Powered by</span>
            <a
              href="https://monad.xyz/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MonadLogo className="w-4 h-4" />
              <span className="font-semibold">Monad Testnet</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
