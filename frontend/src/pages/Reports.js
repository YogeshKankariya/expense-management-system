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
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Reports</h1>
          <p className="page-subtitle">
            Comprehensive analytics and insights into your spending habits
          </p>
        </div>
        <Link to="/expenses" className="btn btn-outline">
          Manage Expenses
        </Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Generating reports...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && expenses.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h2>No expenses available to generate reports.</h2>
          <p>
            Start adding your daily expenses to see analytics, category breakdowns,
            and monthly trends.
          </p>
          <Link to="/expenses" className="btn btn-primary" state={{ openAdd: true }}>
            + Add First Expense
          </Link>
        </div>
      )}

      {/* Main Content when expenses exist */}
      {!loading && expenses.length > 0 && (
        <>
          {/* 1. Report Summary Cards */}
          <div className="report-summary-grid">
            <div className="report-summary-card">
              <span className="report-stat-icon">💰</span>
              <div>
                <p className="report-stat-label">Total Spending</p>
                <h3 className="report-stat-value">{formatAmount(totalSpending)}</h3>
                <p className="report-stat-sub">Across all categories</p>
              </div>
            </div>

            <div className="report-summary-card">
              <span className="report-stat-icon">📊</span>
              <div>
                <p className="report-stat-label">Average Expense</p>
                <h3 className="report-stat-value">{formatAmount(averageExpense)}</h3>
                <p className="report-stat-sub">Per transaction</p>
              </div>
            </div>

            <div className="report-summary-card">
              <span className="report-stat-icon">🏆</span>
              <div>
                <p className="report-stat-label">Highest Expense</p>
                <h3 className="report-stat-value">
                  {highestExpense ? formatAmount(highestExpense.amount) : "₹0"}
                </h3>
                <p className="report-stat-sub">
                  {highestExpense ? highestExpense.title : "None"}
                </p>
              </div>
            </div>

            <div className="report-summary-card">
              <span className="report-stat-icon">⭐</span>
              <div>
                <p className="report-stat-label">Most Used Category</p>
                <h3 className="report-stat-value">
                  {mostUsedCategory ? mostUsedCategory.category : "None"}
                </h3>
                <p className="report-stat-sub">
                  {mostUsedCategory
                    ? `${mostUsedCategory.count} ${
                        mostUsedCategory.count === 1 ? "expense" : "expenses"
                      }`
                    : "No data"}
                </p>
              </div>
            </div>

            <div className="report-summary-card">
              <span className="report-stat-icon">🧾</span>
              <div>
                <p className="report-stat-label">Number of Expenses</p>
                <h3 className="report-stat-value">{numberOfExpenses}</h3>
                <p className="report-stat-sub">Total recorded</p>
              </div>
            </div>
          </div>

          {/* 2. Category Report */}
          <div className="report-section">
            <h2 className="section-title">Category Report</h2>
            <p className="section-subtitle">
              Breakdown of spending and transaction volume per category
            </p>

            <div className="report-two-col">
              {/* Category Table */}
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-center">Number of Expenses</th>
                      <th className="text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryReport.map((cat, idx) => (
                      <tr key={cat.category}>
                        <td>
                          <span
                            className="color-dot"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[cat.category] ||
                                PALETTE[idx % PALETTE.length],
                            }}
                          />
                          <strong>{cat.category}</strong>
                        </td>
                        <td className="text-center">
                          {cat.count} {cat.count === 1 ? "expense" : "expenses"}
                        </td>
                        <td className="text-right font-bold">
                          {formatAmount(cat.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Category Visualization */}
              <div className="report-chart-box">
                <h4 className="chart-box-title">Category Distribution</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryReport}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="45%"
                      outerRadius={75}
                      innerRadius={35}
                      paddingAngle={3}
                    >
                      {categoryReport.map((entry, idx) => (
                        <Cell
                          key={`cat-cell-${entry.category}`}
                          fill={
                            CATEGORY_COLORS[entry.category] ||
                            PALETTE[idx % PALETTE.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatAmount(value), "Total"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: "10px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Monthly Report */}
          <div className="report-section">
            <h2 className="section-title">Monthly Spending Report</h2>
            <p className="section-subtitle">
              Recent monthly spending history (latest 6 recorded months)
            </p>

            <div className="report-two-col">
              {/* Monthly Table */}
              <div className="table-responsive">
                <table className="report-table">
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
                          <strong>{m.month}</strong>
                        </td>
                        <td className="text-center">{m.count}</td>
                        <td className="text-right font-bold">
                          {formatAmount(m.totalSpending)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monthly Bar Chart */}
              <div className="report-chart-box">
                <h4 className="chart-box-title">Monthly Trend</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={monthlyReport}
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
                      dataKey="totalSpending"
                      fill="#1a7a4a"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Report Page Expense Table */}
          <div className="report-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Expense Transactions</h2>
                <p className="section-subtitle">
                  All expenses used to compile this report (sorted newest first)
                </p>
              </div>
              <span className="badge-count">
                {tableExpenses.length} Records
              </span>
            </div>

            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tableExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="text-muted">{formatDate(exp.date)}</td>
                      <td>
                        <strong>{exp.title}</strong>
                        {exp.description && (
                          <div className="table-desc">{exp.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="expense-category-badge">
                          {exp.category}
                        </span>
                      </td>
                      <td className="text-right font-bold">
                        {formatAmount(exp.amount)}
                      </td>
                    </tr>
                  ))}
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
