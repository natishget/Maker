"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { protectedRouteAsync } from "./API/ApiSlice";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Rehydrate auth from server cookie/session on app load
    store.dispatch(protectedRouteAsync());
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
