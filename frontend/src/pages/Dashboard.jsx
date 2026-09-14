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

  useEffect(() => {
    api.get("dashboard/").then((response) => setData(response.data));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  const categoryChart = {
    labels: data.expense_by_category.map((item) => item.category__name || "Other"),
    datasets: [
      {
        data: data.expense_by_category.map((item) => item.total),
        backgroundColor: data.expense_by_category.map(
          (item) => item.category__color || "#64748b"
        ),
      },
    ],
  };

  const groupedMonths = {};

  data.monthly_activity.forEach((item) => {
    const month = new Date(item.month).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!groupedMonths[month]) groupedMonths[month] = { income: 0, expense: 0 };
    groupedMonths[month][item.type] = Number(item.total);
  });

  const activityChart = {
    labels: Object.keys(groupedMonths),
    datasets: [
      {
        label: "Income",
        data: Object.values(groupedMonths).map((item) => item.income),
        backgroundColor: "#22c55e",
      },
      {
        label: "Expenses",
        data: Object.values(groupedMonths).map((item) => item.expense),
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
        <StatCard title="Income" value={data.income} type="income" />
        <StatCard title="Expenses" value={data.expenses} type="expense" />
        <StatCard title="Balance" value={data.balance} type="balance" />
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h2>Expenses by category</h2>
          {data.expense_by_category.length ? (
            <Doughnut data={categoryChart} />
          ) : (
            <p>No expense data this month.</p>
          )}
        </div>

        <div className="card chart-card">
          <h2>Monthly activity</h2>
          <Bar data={activityChart} />
        </div>
      </div>

      <div className="card">
        <h2>Recent transactions</h2>
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
            {data.recent_transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category_name || "Uncategorized"}</td>
                <td>{transaction.type}</td>
                <td className={transaction.type}>
                  {transaction.type === "income" ? "+" : "-"}₹
                  {Number(transaction.amount).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}