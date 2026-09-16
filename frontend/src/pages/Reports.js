import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { getExpenses } from "../services/expenseService";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CATEGORY_META = {
  Food: { icon: "🍔", color: "#f59e0b", bg: "#fef3c7" },
  Transport: { icon: "🚌", color: "#3b82f6", bg: "#dbeafe" },
  Shopping: { icon: "🛍️", color: "#ec4899", bg: "#fce7f3" },
  Bills: { icon: "💡", color: "#ef4444", bg: "#fee2e2" },
  Education: { icon: "📚", color: "#8b5cf6", bg: "#ede9fe" },
  Entertainment: { icon: "🎬", color: "#10b981", bg: "#d1fae5" },
  Healthcare: { icon: "🏥", color: "#06b6d4", bg: "#cffafe" },
  Other: { icon: "📦", color: "#64748b", bg: "#f1f5f9" },
};

const PALETTE = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#64748b",
];

// Custom Chart Tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-title">{label || data.name}</p>
        <p className="tooltip-value">{formatAmount(data.value)}</p>
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/login");
        return;
      }
      setError(
        status === 500
          ? "Server error. Please try again later."
          : err.response?.data?.message || "Failed to load reports data."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // --- Statistics Calculations ---
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const numberOfExpenses = expenses.length;

  const averageExpense = useMemo(() => {
    return numberOfExpenses > 0 ? totalSpending / numberOfExpenses : 0;
  }, [numberOfExpenses, totalSpending]);

  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce(
      (max, e) => (e.amount > max.amount ? e : max),
      expenses[0]
    );
  }, [expenses]);

  const mostUsedCategory = useMemo(() => {
    if (expenses.length === 0) return null;
    const counts = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    let topCat = "";
    let max = 0;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > max) {
        max = count;
        topCat = cat;
      }
    });

    return { category: topCat, count: max };
  }, [expenses]);

  // --- Category Breakdown (Sorted by total amount descending) ---
  const categoryReport = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      if (!map[cat]) {
        map[cat] = { category: cat, count: 0, totalAmount: 0 };
      }
      map[cat].count += 1;
      map[cat].totalAmount += e.amount;
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [expenses]);

  // --- Monthly Spending (Recent 6 months with data) ---
  const monthlyReport = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) {
        map[key] = {
          key,
          month: d.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          totalSpending: 0,
          count: 0,
        };
      }
      map[key].totalSpending += e.amount;
      map[key].count += 1;
    });

    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [expenses]);

  // --- Expenses sorted newest first for report table ---
  const tableExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses]);

  return (
    <div className="reports-page-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">
            Comprehensive financial insights, category distribution, and spending trends
          </p>
        </div>
        <Link to="/expenses" className="btn btn-secondary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Manage Expenses</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state-card">
          <div className="spinner" />
          <p>Generating financial reports and computing analytics...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && expenses.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-icon-circle">📊</div>
          <h2 className="empty-title">No expenses available to generate reports.</h2>
          <p className="empty-subtitle">
            Log your daily expenses to view analytical charts, category breakdowns,
            and monthly financial summaries.
          </p>
          <Link
            to="/expenses"
            className="btn btn-primary"
            state={{ openAdd: true }}
          >
            + Add First Expense
          </Link>
        </div>
      )}

      {/* Main Content when expenses exist */}
      {!loading && expenses.length > 0 && (
        <>
          {/* 1. Report Summary Cards (5 Metrics) */}
          <div className="reports-metrics-grid">
            {/* Total Spending */}
            <div className="report-metric-card">
              <div className="report-metric-icon-wrap icon-indigo">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="report-metric-info">
                <span className="report-metric-label">Total Spending</span>
                <span className="report-metric-value">
                  {formatAmount(totalSpending)}
                </span>
                <span className="report-metric-sub">Across all categories</span>
              </div>
            </div>

            {/* Average Expense */}
            <div className="report-metric-card">
              <div className="report-metric-icon-wrap icon-emerald">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="report-metric-info">
                <span className="report-metric-label">Average Expense</span>
                <span className="report-metric-value">
                  {formatAmount(averageExpense)}
                </span>
                <span className="report-metric-sub">Per transaction</span>
              </div>
            </div>

            {/* Highest Expense */}
            <div className="report-metric-card">
              <div className="report-metric-icon-wrap icon-amber">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="report-metric-info">
                <span className="report-metric-label">Highest Expense</span>
                <span className="report-metric-value">
                  {highestExpense ? formatAmount(highestExpense.amount) : "₹0"}
                </span>
                <span className="report-metric-sub" title={highestExpense?.title}>
                  {highestExpense ? highestExpense.title : "None"}
                </span>
              </div>
            </div>

            {/* Most Used Category */}
            <div className="report-metric-card">
              <div className="report-metric-icon-wrap icon-purple">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div className="report-metric-info">
                <span className="report-metric-label">Top Category</span>
                <span className="report-metric-value">
                  {mostUsedCategory ? mostUsedCategory.category : "None"}
                </span>
                <span className="report-metric-sub">
                  {mostUsedCategory
                    ? `${mostUsedCategory.count} ${
                        mostUsedCategory.count === 1 ? "expense" : "expenses"
                      }`
                    : "No data"}
                </span>
              </div>
            </div>

            {/* Total Count */}
            <div className="report-metric-card">
              <div className="report-metric-icon-wrap icon-sky">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="report-metric-info">
                <span className="report-metric-label">Transactions</span>
                <span className="report-metric-value">{numberOfExpenses}</span>
                <span className="report-metric-sub">Total recorded</span>
              </div>
            </div>
          </div>

          {/* 2. Category Report (Table + Pie Chart) */}
          <div className="report-section-card">
            <div className="report-section-header">
              <div>
                <h2 className="section-title">Category Report</h2>
                <p className="section-subtitle">
                  Breakdown of total spending and transaction count across categories
                </p>
              </div>
            </div>

            <div className="report-split-grid">
              {/* Category Breakdown Table */}
              <div className="report-table-wrapper">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-center">Count</th>
                      <th className="text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryReport.map((cat, idx) => {
                      const meta = CATEGORY_META[cat.category] || CATEGORY_META.Other;
                      return (
                        <tr key={cat.category}>
                          <td>
                            <div className="category-cell">
                              <span
                                className="category-color-dot"
                                style={{
                                  backgroundColor:
                                    meta.color || PALETTE[idx % PALETTE.length],
                                }}
                              />
                              <span className="category-name font-semibold">
                                {cat.category}
                              </span>
                            </div>
                          </td>
                          <td className="text-center text-muted">
                            {cat.count} {cat.count === 1 ? "expense" : "expenses"}
                          </td>
                          <td className="text-right font-bold">
                            {formatAmount(cat.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Category Donut / Pie Chart */}
              <div className="report-chart-box">
                <h3 className="chart-box-title">Distribution Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryReport}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryReport.map((entry, idx) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={
                            CATEGORY_META[entry.category]?.color ||
                            PALETTE[idx % PALETTE.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomChartTooltip />}
                      formatter={(val) => [formatAmount(val), "Total"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: "12px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Monthly Spending Report (Table + Bar Chart) */}
          <div className="report-section-card">
            <div className="report-section-header">
              <div>
                <h2 className="section-title">Monthly Spending Report</h2>
                <p className="section-subtitle">
                  Historical spending totals for recent recorded months
                </p>
              </div>
            </div>

            <div className="report-split-grid">
              {/* Monthly Table */}
              <div className="report-table-wrapper">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="text-center">Transactions</th>
                      <th className="text-right">Total Spending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReport.map((m) => (
                      <tr key={m.key}>
                        <td>
                          <span className="font-semibold">{m.month}</span>
                        </td>
                        <td className="text-center text-muted">{m.count}</td>
                        <td className="text-right font-bold text-primary-color">
                          {formatAmount(m.totalSpending)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monthly Trend Bar Chart */}
              <div className="report-chart-box">
                <h3 className="chart-box-title">Monthly Spending Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={monthlyReport}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val}`
                      }
                    />
                    <Tooltip
                      content={<CustomChartTooltip />}
                      formatter={(val) => [formatAmount(val), "Spent"]}
                    />
                    <Bar
                      dataKey="totalSpending"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Report Page Expense Table */}
          <div className="report-section-card">
            <div className="report-section-header">
              <div>
                <h2 className="section-title">Expense Transactions</h2>
                <p className="section-subtitle">
                  Complete list of transactions used for this report (newest first)
                </p>
              </div>
              <span className="table-records-badge">
                {tableExpenses.length} Records
              </span>
            </div>

            <div className="table-responsive-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tableExpenses.map((exp) => {
                    const meta =
                      CATEGORY_META[exp.category] || CATEGORY_META.Other;
                    return (
                      <tr key={exp.id}>
                        <td className="text-muted table-date-cell">
                          {formatDate(exp.date)}
                        </td>
                        <td>
                          <div className="table-title-cell">
                            <span className="table-title-text font-semibold">
                              {exp.title}
                            </span>
                            {exp.description && (
                              <span className="table-desc-text">
                                {exp.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className="expense-category-badge"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.color,
                            }}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td className="text-right font-bold table-amount-cell">
                          {formatAmount(exp.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
