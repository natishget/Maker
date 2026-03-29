import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

const Navigation = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.api.user);
  return (
    <nav className="flex items-center justify-between py-4 px-22 bg-white text-blue-900 font-semibold shadow-md ">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">
        Byte<span className="text-blue-900">Forge</span>
      </h1>
      <div className=" flex gap-10 text-xl ">
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
      </div>
    </nav>
  );
};

export default Navigation;
