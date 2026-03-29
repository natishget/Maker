"use client";

import { notFound } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import UsersTable from "@/components/table/usersTable";
import { getUsersDataAsync } from "@/state/API/ApiSlice";

import Navigation from "@/components/navigation";

import DialogForUser from "@/components/dialogs/dialogForUser";

const Page = () => {
    const dispatch = useDispatch();
    const { allUsers, loading, error, user, initialized } = useSelector((state) => state.api);

    useEffect(() => {
        if (initialized && user?.role === "admin" && !allUsers) {
            dispatch(getUsersDataAsync());
        }
    }, [dispatch, allUsers, initialized, user?.role]);

    if (!initialized) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Navigation />

                <main className="p-6">
                    <p className="text-gray-600">Checking access...</p>
                </main>
            </div>
        );
    }

    if (user?.role !== "admin") {
        notFound();
    }

  return (
    <div className="bg-gray-100 min-h-screen">
            <Navigation />

            <div className="flex justify-end mx-5 mt-5">
                <DialogForUser />
            </div>

            <main className="p-6">
                {error && <p className="mb-4 text-red-600">{error}</p>}
                {loading && !allUsers ? (
                    <p className="text-gray-600">Loading users...</p>
                ) : (
                    <UsersTable />
                )}
            </main>
        </div>
    );
};

export default Page;