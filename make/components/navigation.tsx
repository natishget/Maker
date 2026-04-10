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
    <nav className="flex items-center justify-between py-4 px-22 bg-white text-blue-900 font-semibold shadow-md ">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">
        Byte<span className="text-blue-900">Forge</span>
      </h1>
      <div className=" flex items-center gap-10 text-xl ">
        <Link
          href="/users"
          className={`hover:text-orange-500 ${user?.role === "admin" ? "" : "hidden"}`}
        >
          Users
        </Link>
        <Link
          href="/companies"
          className={`hover:text-orange-500 ${user?.role === "admin" ? "" : "hidden"}`}
        >
          Companies
        </Link>
        <Link href="/" className="hover:text-orange-500">
          Calculate
        </Link>
        <div className="relative w-10">
          <div className="w-4 h-4 rounded-full bg-red-600 flex justify-center items-center text-white absolute top-0 right-0 text-xs">
            {cartItems.length}
          </div>
          <Link href="/pdf">
            <ShoppingCart className="w-8" />
          </Link>
        </div>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md border border-red-500 px-4 py-2 text-base text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navigation;
