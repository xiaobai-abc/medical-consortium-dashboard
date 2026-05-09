"use client";

import { useEffect, useState } from "react";

import { getDashboardData } from "@/api";
import { buildHomeDashboardView } from "../modules/dashboard-view-model";
import SectionBody from "./section";

function HomeDashboardClient() {
  const [dashboardState, setDashboardState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(function requestDashboardOnMount() {
    let disposed = false;

    setDashboardState({
      status: "loading",
      data: null,
      error: null,
    });

    getDashboardData()
      .then(function handleSuccess(dashboardData) {
        if (disposed) {
          return;
        }

        setDashboardState({
          status: "success",
          data: dashboardData,
          error: null,
        });
      })
      .catch(function handleError(error) {
        if (disposed) {
          return;
        }

        setDashboardState({
          status: "error",
          data: null,
          error,
        });
      });

    return function cleanupDashboardRequest() {
      disposed = true;
    };
  }, []);

  return (
    <SectionBody
      dashboardStatus={dashboardState.status}
      dashboardError={dashboardState.error}
      dashboardView={buildHomeDashboardView(dashboardState.data)}
    />
  );
}

export default HomeDashboardClient;
