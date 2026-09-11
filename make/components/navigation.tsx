"use client";

import React from "react";
import Link from "next/link";
import { LogOut, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/state/store";
import { clearUser, logoutAsync } from "@/state/API/ApiSlice";

const Navigation = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.api.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
    } catch {
      // Ignore logout request errors and clear the client state anyway.
    } finally {
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <nav className="flex items-center justify-between py-4 md:px-12 px-6 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-90">
          Byte<span className="text-blue-500">Forge</span>
        </Link>
        {/* <span className="hidden md:inline text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
          PRO CALCULATOR
        </span> */}
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link
          href="/users"
          className={`hover:text-blue-400 transition-colors ${user?.role === "admin" ? "" : "hidden"
            }`}
        >
          Users
        </Link>
        <Link
          href="/companies"
          className={`hover:text-blue-400 transition-colors ${user?.role === "admin" ? "" : "hidden"
            }`}
        >
          Companies
        </Link>
        <Link
          href="/"
          className="hover:text-blue-400 transition-colors"
        >
          Book & Brochure
        </Link>
        <Link
          href="/signage"
          className="hover:text-blue-400 transition-colors text-blue-400 font-semibold"
        >
          Signage
        </Link>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://maker-led.vercel.app/"
          className="hover:text-blue-400 transition-colors text-slate-400"
        >
          LED-Maker
        </a>

        <div className="relative flex items-center pl-2">
          <Link
            href="/pdf"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-xs font-semibold"
          >
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>Quotation Cart</span>
            <span className="ml-1 bg-blue-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </Link>
        </div>

        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-500/20 font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navigation;
