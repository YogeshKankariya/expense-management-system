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

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Bills: "💡",
  Education: "📚",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Other: "📦",
};

const CATEGORY_COLORS = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#ef4444",
  Education: "#8b5cf6",
  Entertainment: "#10b981",
  Healthcare: "#06b6d4",
  Other: "#6b7280",
};

const PALETTE = [
  "#0f4c81",
  "#1a7a4a",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#6b7280",
];

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
    <div className="dashboard-page-full">
      {/* Welcome header */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.name || "there"}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Here's a summary of your expenses.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/expenses" className="btn btn-outline">
            View All Expenses
          </Link>
          <Link
            to="/expenses"
            className="btn btn-primary"
            state={{ openAdd: true }}
          >
            + Add Expense
          </Link>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card summary-card-blue">
          <p className="summary-label">Total Spent</p>
          {loading ? (
            <div className="skeleton skeleton-amount" />
          ) : (
            <p className="summary-amount">{formatAmount(totalAmount)}</p>
          )}
          <p className="summary-sub">All time</p>
        </div>

        <div className="summary-card summary-card-green">
          <p className="summary-label">This Month</p>
          {loading ? (
            <div className="skeleton skeleton-amount" />
          ) : (
            <p className="summary-amount">{formatAmount(currentMonthTotal)}</p>
          )}
          <p className="summary-sub">
            {now.toLocaleString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="summary-card summary-card-purple">
          <p className="summary-label">Transactions</p>
          {loading ? (
            <div className="skeleton skeleton-number" />
          ) : (
            <p className="summary-number">{totalCount}</p>
          )}
          <p className="summary-sub">Total expenses</p>
        </div>
      </div>

      {/* Spending Overview (Charts) */}
      <div className="charts-section">
        <div className="section-header-row">
          <h2 className="section-title">Spending Overview</h2>
          <Link to="/reports" className="link-view-all">
            Detailed Reports →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading charts...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="chart-empty-state">
            <p>No expense data available yet.</p>
          </div>
        ) : (
          <div className="charts-grid">
            {/* Chart 1: Category Distribution */}
            <div className="chart-card">
              <h3 className="chart-card-title">Category Breakdown</h3>
              <p className="chart-card-subtitle">Distribution by category</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${entry.name}`}
                        fill={
                          CATEGORY_COLORS[entry.name] ||
                          PALETTE[index % PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatAmount(value), "Spent"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "12px", fontSize: "0.82rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Monthly Spending */}
            <div className="chart-card">
              <h3 className="chart-card-title">Monthly Spending</h3>
              <p className="chart-card-subtitle">
                Spending trend (Recent 6 months)
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#4a5568" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#4a5568" }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatAmount(value), "Spent"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#0f4c81"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent expenses */}
      <div className="recent-section">
        <div className="recent-header">
          <h2 className="section-title">Recent Expenses</h2>
          <Link to="/expenses" className="link-view-all">
            View all →
          </Link>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        )}

        {!loading && expenses.length === 0 && (
          <div className="empty-state empty-state-sm">
            <span className="empty-icon">💸</span>
            <h3>No expenses yet</h3>
            <p>Add your first expense to start tracking.</p>
            <Link to="/expenses" className="btn btn-primary">
              + Add Expense
            </Link>
          </div>
        )}

        {!loading && recentExpenses.length > 0 && (
          <ul className="recent-list">
            {recentExpenses.map((expense) => (
              <li key={expense.id} className="recent-item">
                <span className="recent-icon">
                  {CATEGORY_ICONS[expense.category] || "📦"}
                </span>
                <div className="recent-info">
                  <p className="recent-title">{expense.title}</p>
                  <p className="recent-meta">
                    {expense.category} · {formatDate(expense.date)}
                  </p>
                </div>
                <p className="recent-amount">{formatAmount(expense.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
