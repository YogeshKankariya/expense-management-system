import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
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

// Custom SaaS Chart Tooltip
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

const Dashboard = () => {
  const { user } = useAuth();
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
          : err.response?.data?.message || "Failed to load expenses."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // --- Compute statistics ---
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  const now = new Date();
  const currentMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const recentExpenses = expenses.slice(0, 5);

  // --- Chart Data: Category-wise Spending ---
  const categoryChartData = useMemo(() => {
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // --- Chart Data: Monthly Spending (most recent 6 months with data) ---
  const monthlyChartData = useMemo(() => {
    const monthlyTotals = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          key,
          month: d.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          amount: 0,
        };
      }
      monthlyTotals[key].amount += e.amount;
    });

    return Object.values(monthlyTotals)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [expenses]);

  return (
    <div className="dashboard-page-container">
      {/* Top Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">
            Welcome back, {user?.name || "there"}
          </h1>
          <p className="dashboard-subtitle">
            Here's an overview of your personal expenses and financial activity.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/expenses" className="btn btn-secondary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>View All Expenses</span>
          </Link>

          <Link
            to="/expenses"
            className="btn btn-primary"
            state={{ openAdd: true }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Expense</span>
          </Link>
        </div>
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

      {/* 3 Metric Stat Cards */}
      <div className="metrics-grid">
        {/* Card 1: Total Spent */}
        <div className="metric-card metric-card-indigo">
          <div className="metric-icon-wrap icon-indigo">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <circle cx="16" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Expenses</span>
            {loading ? (
              <div className="skeleton skeleton-value" />
            ) : (
              <div className="metric-value">{formatAmount(totalAmount)}</div>
            )}
            <span className="metric-subtext">All-time accumulated spending</span>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="metric-card metric-card-emerald">
          <div className="metric-icon-wrap icon-emerald">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Current Month</span>
            {loading ? (
              <div className="skeleton skeleton-value" />
            ) : (
              <div className="metric-value">{formatAmount(currentMonthTotal)}</div>
            )}
            <span className="metric-subtext">
              {now.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Card 3: Total Count */}
        <div className="metric-card metric-card-sky">
          <div className="metric-icon-wrap icon-sky">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Number of Expenses</span>
            {loading ? (
              <div className="skeleton skeleton-value" />
            ) : (
              <div className="metric-value">{totalCount}</div>
            )}
            <span className="metric-subtext">Recorded transactions</span>
          </div>
        </div>
      </div>

      {/* Spending Overview (Charts) */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Spending Overview</h2>
            <p className="section-card-subtitle">
              Visual breakdown of your category distribution and monthly spending trends
            </p>
          </div>
          <Link to="/reports" className="link-arrow">
            <span>View Full Reports</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-inline">
            <div className="spinner" />
            <p>Loading chart visualizations...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="charts-empty-placeholder">
            <div className="empty-icon-circle">📊</div>
            <p className="empty-title">No expense data available yet.</p>
            <p className="empty-subtitle">
              Add your first expense to unlock visual category and trend insights.
            </p>
          </div>
        ) : (
          <div className="charts-grid-two">
            {/* Chart 1: Category Distribution */}
            <div className="chart-box">
              <div className="chart-box-header">
                <h3 className="chart-box-title">Category Breakdown</h3>
                <span className="chart-box-tag">By spending</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          CATEGORY_META[entry.name]?.color ||
                          PALETTE[index % PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "14px", fontSize: "0.82rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Monthly Spending */}
            <div className="chart-box">
              <div className="chart-box-header">
                <h3 className="chart-box-title">Monthly Spending</h3>
                <span className="chart-box-tag">Recent 6 Months</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyChartData}
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
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="amount"
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Expenses List */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Recent Transactions</h2>
            <p className="section-card-subtitle">
              Your 5 latest logged expenses
            </p>
          </div>
          <Link to="/expenses" className="link-arrow">
            <span>View All</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-inline">
            <div className="spinner" />
            <p>Loading recent transactions...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state-card-compact">
            <div className="empty-icon-circle">💸</div>
            <p className="empty-title">No expenses yet</p>
            <p className="empty-subtitle">
              Start tracking by adding your first expense today.
            </p>
            <Link
              to="/expenses"
              className="btn btn-primary btn-sm"
              state={{ openAdd: true }}
            >
              + Add Expense
            </Link>
          </div>
        ) : (
          <div className="recent-list-container">
            {recentExpenses.map((expense) => {
              const meta =
                CATEGORY_META[expense.category] || CATEGORY_META.Other;
              return (
                <div key={expense.id} className="recent-row">
                  <div className="recent-row-left">
                    <div
                      className="recent-icon-circle"
                      style={{ backgroundColor: meta.bg }}
                      aria-hidden="true"
                    >
                      <span>{meta.icon}</span>
                    </div>
                    <div className="recent-details">
                      <p className="recent-row-title">{expense.title}</p>
                      <div className="recent-meta-line">
                        <span
                          className="recent-category-pill"
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {expense.category}
                        </span>
                        <span className="recent-date-bullet">•</span>
                        <span className="recent-row-date">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="recent-row-right">
                    <span className="recent-row-amount">
                      {formatAmount(expense.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
