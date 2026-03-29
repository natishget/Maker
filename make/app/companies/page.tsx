"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import CompaniesTable from "@/components/table/companiesTable";
import { getCompaniesDataAsync } from "@/state/API/ApiSlice";
import type { AppDispatch, RootState } from "@/state/store";

import Navigation from "@/components/navigation";

const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, user, loading, error, initialized } = useSelector(
    (state: RootState) => state.api,
  );

  useEffect(() => {
    if (initialized && user?.role === "admin" && !companies) {
      dispatch(getCompaniesDataAsync());
    }
  }, [dispatch, companies, initialized, user?.role]);

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

      <main className="p-6">
        {error && <p className="mb-4 text-red-600">{error}</p>}
        {loading && !companies ? (
          <p className="text-gray-600">Loading companies...</p>
        ) : (
          <CompaniesTable />
        )}
      </main>
    </div>
  );
};

export default Page;
