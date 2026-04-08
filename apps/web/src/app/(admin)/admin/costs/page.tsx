"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CostSummaryResponse } from "@/types/api";

const FEATURE_COLORS: Record<string, string> = {
  mining: "#5ccde5",
  overview: "#ff3b93",
  appraisal: "#f59e0b",
  full_overview: "#a855f7",
};

const FEATURE_LABELS: Record<string, string> = {
  mining: "채굴",
  overview: "개요서",
  appraisal: "감정서",
  full_overview: "풀 개요서",
};

const PERIOD_OPTIONS = [
  { days: 7, label: "7일" },
  { days: 14, label: "14일" },
  { days: 30, label: "30일" },
] as const;

export default function AdminCostsPage() {
  const [days, setDays] = useState(7);

  const { data, isLoading, error } = useQuery<CostSummaryResponse>({
    queryKey: ["admin", "costs", days],
    queryFn: () => adminApi.getCostsSummary(days),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        비용 데이터를 불러올 수 없습니다
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">AI 비용</h1>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(({ days: d, label }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 text-xs transition-all ${
                days === d
                  ? "border border-amber-400/30 bg-amber-400/15 text-amber-400"
                  : "border border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="총 비용"
          value={`$${data.total_cost_usd.toFixed(4)}`}
          sub={`최근 ${days}일`}
        />
        <SummaryCard
          label="총 호출"
          value={data.total_calls.toLocaleString()}
          sub="API 요청 수"
        />
        <SummaryCard
          label="평균 비용/호출"
          value={`$${data.avg_cost_per_call.toFixed(5)}`}
          sub="호출당 평균"
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-medium text-text-secondary">
          일별 비용 추이
        </h2>
        {data.by_date_feature.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.by_date_feature}>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(5)}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,12,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(v) => `${v}`}
                formatter={(value, name) => [
                  `$${Number(value).toFixed(5)}`,
                  FEATURE_LABELS[name as string] || name,
                ]}
              />
              <Legend
                formatter={(value: string) => FEATURE_LABELS[value] || value}
                wrapperStyle={{ fontSize: "11px" }}
              />
              {Object.keys(FEATURE_COLORS).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="cost"
                  fill={FEATURE_COLORS[key]}
                  radius={
                    key === "full_overview" ? [2, 2, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-40 items-center justify-center text-text-secondary/40">
            아직 데이터가 없습니다
          </div>
        )}
      </div>

      {/* Feature Breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">
          기능별 비용
        </h2>
        {data.by_feature.length > 0 ? (
          <div className="space-y-2">
            {data.by_feature.map((f) => (
              <div
                key={f.feature_type}
                className="flex items-center justify-between rounded-lg bg-surface-1/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        FEATURE_COLORS[f.feature_type] || "#888",
                    }}
                  />
                  <span className="text-sm text-text-primary">
                    {FEATURE_LABELS[f.feature_type] || f.feature_type}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-secondary">
                    {f.calls}회
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    ${f.cost.toFixed(5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-text-secondary/40">
            아직 데이터가 없습니다
          </div>
        )}
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">
          최근 호출 로그
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-text-secondary/50">
                <th className="pb-2 pr-4">시간</th>
                <th className="pb-2 pr-4">기능</th>
                <th className="pb-2 pr-4">모델</th>
                <th className="pb-2 pr-4 text-right">입력</th>
                <th className="pb-2 pr-4 text-right">출력</th>
                <th className="pb-2 pr-4 text-right">비용</th>
                <th className="pb-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/[0.04] text-text-secondary"
                >
                  <td className="py-2 pr-4 text-xs">
                    {new Date(log.created_at).toLocaleString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            FEATURE_COLORS[log.feature_type] || "#888",
                        }}
                      />
                      {FEATURE_LABELS[log.feature_type] || log.feature_type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{log.model}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">
                    {log.input_tokens.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">
                    {log.output_tokens.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">
                    ${log.total_cost_usd.toFixed(5)}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
              {data.recent_logs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-text-secondary/50"
                  >
                    아직 로그가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-secondary/50">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-text-primary">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-text-secondary/40">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    filtered: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  };
  const s = styles[status] || styles.success;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${s}`}>
      {status}
    </span>
  );
}
