"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { DashboardData } from "@/lib/internalRequestTypes";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `₦${(n / 1_000).toFixed(0)}k`
      : `₦${n}`;

const formatMonth = (year: number, month: number) =>
  new Date(year, month - 1).toLocaleString("default", {
    month: "short",
    year: "2-digit",
  });

const STATUS_DOT: Record<string, string> = {
  approved: "bg-emerald-500",
  pending: "bg-amber-400",
  rejected: "bg-red-500",
  "in review": "bg-blue-500",
  completed: "bg-teal-500",
  outstanding: "bg-orange-400",
};

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
];

const tooltipStyle = {
  backgroundColor: "#1c1c21",
  border: "1px solid #2a2a35",
  borderRadius: 4,
  fontSize: 12,
  color: "#e2e2e7",
};

export default function Dashboard({
  data,
  handleDateRangeChange,
  activeFilter,
}: {
  data: DashboardData;
  handleDateRangeChange: (date: string) => void;
  activeFilter: string | null;
}) {
  const { overview, insights } = data;

  const monthlyData = data.monthlyTrends.map((m) => ({
    name: formatMonth(m._id.year, m._id.month),
    amount: m.totalAmount,
    count: m.count,
    approved: m.approved,
    pending: m.pending,
  }));

  const categoryData = data.categoryCount.map((c, i) => ({
    name: c._id,
    value: c.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const totalReqs = overview.total || 1;

  return (
    <div className="min-h-screen  text-[#1d1d24]">
      {/* Top bar */}
      <div className="border-b border-[#e0dfe8] bg-white px-6  flex items-center justify-between"></div>

      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5">
            {[
              { label: "7D" },
              { label: "30D" },
              { label: "90D" },
              { label: "1Y" },
              { label: "All" },
            ].map((p: { label: string }) => (
              <button
                onClick={() => handleDateRangeChange(p.label)}
                key={p.label}
                className={`px-2.5 py-1 text-xs dark:text-white rounded font-medium transition-colors ${
                  activeFilter === p.label
                    ? "bg-[#6366f1] text-white"
                    : "text-[#80708f] dark:hover:bg-accent hover:bg-[#f0eef5]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/* STAT STRIP */}
        <div className="grid grid-cols-2 gap-px bg-[#e0dfe8] dark:bg-[#333] rounded-md overflow-hidden border border-[#e0dfe8] lg:grid-cols-5">
          {[
            { label: "Total Requests", value: overview.total, mono: true },
            {
              label: "Approved",
              value: overview.approved,
              color: "text-emerald-600 dark:text-emerald-400",
              mono: true,
            },
            {
              label: "Pending",
              value: overview.pending,
              color: "text-amber-500 dark:text-amber-400",
              mono: true,
            },
            {
              label: "Rejected",
              value: overview.rejected,
              color: "text-red-500 dark:text-red-400",
              mono: true,
            },
            {
              label: "Total Spend",
              value: fmtShort(overview.totalAmount),
              span: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-white dark:bg-black px-4 py-3 ${s.span ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <p className="text-[11px] text-[#80708f] dark:text-white uppercase tracking-wide mb-1">
                {s.label}
              </p>
              <p
                className={`text-xl font-semibold ${s.color || "text-[#1d1d24] dark:text-white"} ${s.mono ? "font-mono" : ""}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* INSIGHT STRIP */}
        <div className="flex gap-5 text-xs text-[#80708f] border-b border-[#e0dfe8] pb-4">
          <span>
            Approval rate{" "}
            <strong className="text-[#1d1d24] dark:text-white font-semibold">
              {insights.approvalRate}%
            </strong>
          </span>
          <span className="dark:text-white text-[#e0dfe8]">|</span>
          <span>
            Avg processing{" "}
            <strong className="text-[#1d1d24] dark:text-white font-semibold">
              {insights.avgProcessingDays} days
            </strong>
          </span>
          <span className="dark:text-white text-[#e0dfe8]">|</span>
          <span>
            Top dept{" "}
            <strong className="dark:text-white text-[#1d1d24] font-semibold">
              {insights.topDepartment}
            </strong>
          </span>
          <span className="text-[#e0dfe8] dark:text-white">|</span>
          <span>
            MoM{" "}
            <strong
              className={`font-semibold ${
                insights.monthOverMonthGrowth > 0
                  ? "text-emerald-600"
                  : insights.monthOverMonthGrowth < 0
                    ? "text-red-500"
                    : "text-[#1d1d24]"
              }`}
            >
              {insights.monthOverMonthGrowth > 0 ? "+" : ""}
              {insights.monthOverMonthGrowth}%
            </strong>
          </span>
        </div>

        {/* CHARTS */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Monthly spend — takes 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md p-4">
            <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
              Monthly Spend
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barSize={14} barGap={2}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0eef5 dark:stroke-gray-800"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#80708f" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 11, fill: "#80708f" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v) => [fmt(Number(v)), "Amount"]}
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "#f0eef5" }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category donut */}
          <div className="bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md p-4">
            <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
              By Category
            </p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={32}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {categoryData.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v} reqs`, n]}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {categoryData.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-[#1d1d24] dark:text-gray-200 capitalize">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[#80708f] dark:text-gray-400 font-mono">
                    {Math.round((c.value / totalReqs) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REQUEST VOLUME LINE */}
        <div className="bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md p-4">
          <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
            Request Volume
          </p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0eef5 dark:stroke-gray-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#80708f" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#80708f" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  dot={false}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  name="Approved"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLES */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Table
            title="By Department"
            columns={[
              { key: "name", label: "Department" },
              { key: "count", label: "Reqs" },
              { key: "amount", label: "Amount" },
              { key: "approved", label: "Approved" },
              { key: "pending", label: "Pending" },
            ]}
            rows={data.departmentStats.map((d) => ({
              name: d._id || "Unknown",
              count: d.count,
              amount: fmtShort(d.totalAmount),
              approved: d.approved,
              pending: d.pending,
            }))}
          />
          <Table
            title="By Location"
            columns={[
              { key: "name", label: "Location" },
              { key: "count", label: "Reqs" },
              { key: "amount", label: "Amount" },
              { key: "approved", label: "Approved" },
              { key: "pending", label: "Pending" },
            ]}
            rows={data.locationStats.map((l) => ({
              name: l._id || "Unknown",
              count: l.count,
              amount: fmtShort(l.totalAmount),
              approved: l.approved,
              pending: l.pending,
            }))}
          />
        </div>

        {/* RECENT */}
        <div className="bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-gray-700">
            <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide">
              Recent Requisitions
            </p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e0dfe8] dark:border-gray-700">
                {["Title", "Department", "Amount", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.recentRequisitions.map((req) => (
                <tr
                  key={req._id}
                  className="border-b border-[#f0eef5] dark:border-gray-800 hover:bg-[#faf9fc] dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-[#1d1d24] dark:text-gray-200 max-w-[180px] truncate">
                    {req.title}
                  </td>
                  <td className="px-4 py-2.5 text-[#80708f] dark:text-gray-400">
                    {req.department}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#1d1d24] dark:text-gray-200">
                    {fmt(req.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[req.status] || "bg-gray-400"}`}
                      />
                      <span className="text-[#1d1d24] dark:text-gray-200 capitalize">
                        {req.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#80708f] dark:text-gray-400 font-mono">
                    {new Date(req.requestedOn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Table({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-gray-700">
        <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e0dfe8] dark:border-gray-700">
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2 text-left text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide font-medium"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#f0eef5] dark:border-gray-800 hover:bg-[#faf9fc] dark:hover:bg-gray-800/50 transition-colors last:border-0"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="px-4 py-2.5 text-[#1d1d24] dark:text-gray-200 font-mono"
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
