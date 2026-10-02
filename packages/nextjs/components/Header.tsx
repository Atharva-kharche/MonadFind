"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, PlusCircleIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Report Lost Item",
    href: "/create",
    icon: <PlusCircleIcon className="h-4 w-4" />,
  },
  {
    label: "My Items",
    href: "/my-items",
    icon: <ViewColumnsIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-primary/10 text-primary font-semibold" : "text-base-content/80"
              } hover:bg-primary/5 hover:text-primary transition-colors py-2 px-4 text-sm rounded-xl gap-2 flex items-center`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur-xl bg-base-100/80 border-b border-base-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <div className="lg:hidden dropdown" ref={burgerMenuRef}>
              <button
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-circle mr-2"
                onClick={() => setIsDrawerOpen(prev => !prev)}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              {isDrawerOpen && (
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 p-2 shadow-xl bg-base-100 rounded-box w-52 z-50 border border-base-200"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <HeaderMenuLinks />
                </ul>
              )}
            </div>
            
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col ml-1">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70">MONAD<span className="text-primary">Find</span></span>
              </div>
            </Link>

            <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2 ml-8">
              <HeaderMenuLinks />
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};
