"use client";

import React from "react";
import Image from "next/image";
import Loading from "@/public/loginIcons/loading.png";
import { loginAdminSchema } from "@/lib/validationSchema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/state/store";
import { adminLoginAsync } from "@/state/API/ApiSlice";
import { useRouter } from "next/navigation";

type LoginFormData = z.infer<typeof loginAdminSchema>;

const AdminLoginForm = () => {
  const { user, loading, initialized } = useSelector(
    (state: RootState) => state.api,
  );

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (initialized && user) {
    router.push("/users");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginAdminSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(adminLoginAsync(data)).unwrap();
      router.push("/users");
    } catch (err: any) {
      setError(err?.message || "Invalid admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading === false && !user) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans antialiased">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Byte<span className="text-blue-500">Forge</span>
            </h1>
            <p className="text-xs text-slate-400">
              Admin Control Portal Sign In
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block"
              >
                Admin Username
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                placeholder="Username"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.username && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg text-xs text-rose-300 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In to Admin Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
      <Image src={Loading} alt="Loading" className="animate-spin w-10 opacity-80" />
    </div>
  );
};

export default AdminLoginForm;
