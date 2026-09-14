import { useEffect, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../api";
import StatCard from "../components/StatCard";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("dashboard/");

        if (isMounted) {
          setData(response.data);
        }
      } catch (requestError) {
        console.error("Dashboard error:", requestError);

        if (isMounted) {
          setError(
            requestError.response?.data?.detail ||
              "Could not load your dashboard. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section>
        <div className="page-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Loading your financial overview...</p>
          </div>
        </div>

        <p>Loading dashboard...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="page-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Your financial overview for this month.</p>
          </div>
        </div>

        <div className="error">{error}</div>
      </section>
    );
  }

  const expenseByCategory = data?.expense_by_category || [];
  const monthlyActivity = data?.monthly_activity || [];
  const recentTransactions = data?.recent_transactions || [];

  const categoryChart = {
    labels: expenseByCategory.map(
      (item) => item.category__name || "Other"
    ),

    datasets: [
      {
        data: expenseByCategory.map((item) => Number(item.total || 0)),

        backgroundColor: expenseByCategory.map(
          (item) => item.category__color || "#64748b"
        ),
      },
    ],
  };

  const groupedMonths = {};

  monthlyActivity.forEach((item) => {
    const date = new Date(item.month);

    const month = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!groupedMonths[month]) {
      groupedMonths[month] = {
        income: 0,
        expense: 0,
      };
    }

    if (item.type === "income") {
      groupedMonths[month].income = Number(item.total || 0);
    }

    if (item.type === "expense") {
      groupedMonths[month].expense = Number(item.total || 0);
    }
  });

  const activityChart = {
    labels: Object.keys(groupedMonths),

    datasets: [
      {
        label: "Income",
        data: Object.values(groupedMonths).map(
          (item) => item.income
        ),
        backgroundColor: "#22c55e",
      },
      {
        label: "Expenses",
        data: Object.values(groupedMonths).map(
          (item) => item.expense
        ),
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Your financial overview for this month.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Income"
          value={data?.income ?? 0}
          type="income"
        />

        <StatCard
          title="Expenses"
          value={data?.expenses ?? 0}
          type="expense"
        />

        <StatCard
          title="Balance"
          value={data?.balance ?? 0}
          type="balance"
        />
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h2>Expenses by category</h2>

          {expenseByCategory.length > 0 ? (
            <Doughnut
              data={categoryChart}
              options={{
                responsive: true,
                maintainAspectRatio: true,
              }}
            />
          ) : (
            <p>No expense data this month.</p>
          )}
        </div>

        <div className="card chart-card">
          <h2>Monthly activity</h2>

          {monthlyActivity.length > 0 ? (
            <Bar
              data={activityChart}
              options={{
                responsive: true,
                maintainAspectRatio: true,
              }}
            />
          ) : (
            <p>No monthly activity yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Recent transactions</h2>

        {recentTransactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>

                  <td>{transaction.description}</td>

                  <td>
                    {transaction.category_name ||
                      "Uncategorized"}
                  </td>

                  <td>{transaction.type}</td>

                  <td className={transaction.type}>
                    {transaction.type === "income" ? "+" : "-"}₹
                    {Number(transaction.amount || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions yet.</p>
        )}
      </div>
    </section>
  );
}