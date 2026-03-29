"use client";

import React, { useEffect } from "react";
import redBigWave from "@/public/loginIcons/redBigWave.svg";
import blueCircle from "@/public/loginIcons/blueCircle.svg";
import bottomBlue from "@/public/loginIcons/bottomBlue.svg";
import topBlue from "@/public/loginIcons/topBlue.svg";
import lemonTwo from "@/public/loginIcons/lemonTwo.svg";
import smallBlue from "@/public/loginIcons/smallBlue.svg";
import Loading from "@/public/loginIcons/loading.png";

import Image from "next/image";

import { loginAdminSchema } from "@/lib/validationSchema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/state/store";
import { adminLoginAsync, loginAsync } from "@/state/API/ApiSlice";

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
    try {
      const response = await dispatch(adminLoginAsync(data)).unwrap();
      console.log("Admin login successful:", response);
      router.push("/users");
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  if (loading === false && !user) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-[rgb(15,12,41)] from-0% via-[rgb(48,43,99)] via-50% to-[rgb(36,36,62)] to-100% relative overflow-hidden">
        <div className="absolute top-1/6 left-1/2">
          <Image src={redBigWave} alt="Red Big Wave" className="w-[600px]" />
        </div>

        <div className="absolute top-150 left-160">
          <Image src={blueCircle} alt="Blue Circle" className="w-[350px]" />
        </div>

        <div className="absolute -bottom-50 -left-50 overflow-hidden">
          <Image
            src={redBigWave}
            alt="Red Big Wave"
            className="w-[600px] opacity-50"
          />
        </div>

        <div className="absolute top-0 left-100 overflow-hidden">
          <Image src={topBlue} alt="Top Blue" className="" />
        </div>

        <div className="absolute bottom-0 right-0">
          <Image src={bottomBlue} alt="Bottom Blue" className="" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="text-white pt-10 px-18 border-3 border-gray-300 rounded-4xl w-[550px] h-[550px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-lg"
        >
          <h3 className="font-semibold text-xl mb-3">Maker</h3>
          <h1 className="font-semibold text-3xl mb-5">Login</h1>
          <div className="flex flex-col gap-1 mb-3">
            <label htmlFor="username" className="">
              Username
            </label>
            <input
              type="text"
              {...register("username")}
              placeholder="Username"
              className="bg-white p-2 rounded-lg placeholder:text-gray-500 placeholder:italic text-gray-800"
            />
            <p className="text-red-500">{errors.username?.message}</p>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="********"
              className="bg-white p-2 rounded-lg placeholder:text-gray-500 placeholder:italic text-gray-800"
            />
            <p className="text-red-500">{errors.password?.message}</p>
          </div>

          <button className="text-xs">Forget password?</button>
          <br />

          <button className="w-full bg-red-800 py-2 mt-10 font-semibold flex items-center justify-center ">
            {isLoading ? (
              <Image src={Loading} alt="" className="animate-spin w-5 " />
            ) : (
              "Sign In"
            )}
          </button>
          <p className="text-red-500 text-center mt-2">{error}</p>
        </form>

        <div className="absolute top-1/3 left-145">
          <Image src={lemonTwo} alt="Lemon Two" className="w-[250px]" />
        </div>

        <div className="absolute bottom-1/4 right-160">
          <Image src={smallBlue} alt="Small Blue" className="w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(15,12,41)] from-0% via-[rgb(48,43,99)] via-50% to-[rgb(36,36,62)] to-100%">
      <Image src={Loading} alt="Loading" className="animate-spin w-10" />
    </div>
  );
};

export default AdminLoginForm;
