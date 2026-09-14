import { useEffect, useState } from "react";
import api from "../api";
import TransactionForm from "../components/TransactionForm";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  async function loadData() {
    const [transactionResponse, categoryResponse] = await Promise.all([
      api.get("transactions/"),
      api.get("categories/"),
    ]);

    setTransactions(transactionResponse.data);
    setCategories(categoryResponse.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function removeTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`transactions/${id}/`);
    loadData();
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>Record and review your income and expenses.</p>
        </div>
      </div>

      <TransactionForm categories={categories} onCreated={loadData} />

      <div className="card">
        <h2>All transactions</h2>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category_name || "Uncategorized"}</td>
                <td>{transaction.type}</td>
                <td className={transaction.type}>
                  ₹{Number(transaction.amount).toLocaleString("en-IN")}
                </td>
                <td>
                  <button
                    className="danger-button"
                    onClick={() => removeTransaction(transaction.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}