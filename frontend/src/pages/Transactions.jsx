import { useCallback, useEffect, useState } from "react";
import api from "../api";
import TransactionForm from "../components/TransactionForm";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionResponse, categoryResponse] = await Promise.all([
        api.get("transactions/"),
        api.get("categories/"),
      ]);

      setTransactions(
        Array.isArray(transactionResponse.data)
          ? transactionResponse.data
          : transactionResponse.data?.results || []
      );

      setCategories(
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : categoryResponse.data?.results || []
      );
    } catch (requestError) {
      console.error("Transactions loading error:", requestError);

      setError(
        requestError.response?.data?.detail ||
          "Could not load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function removeTransaction(id) {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await api.delete(`transactions/${id}/`);
      await loadData();
    } catch (requestError) {
      console.error("Delete transaction error:", requestError);

      setError(
        requestError.response?.data?.detail ||
          "Could not delete the transaction. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>Record and review your income and expenses.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <TransactionForm
        categories={categories}
        onCreated={loadData}
      />

      <div className="card">
        <h2>All transactions</h2>

        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet. Add your first transaction above.</p>
        ) : (
          <div className="table-wrapper">
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

                    <td>
                      {transaction.category_name || "Uncategorized"}
                    </td>

                    <td>{transaction.type}</td>

                    <td className={transaction.type}>
                      {transaction.type === "income" ? "+" : "-"}₹
                      {formatAmount(transaction.amount)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => removeTransaction(transaction.id)}
                        disabled={deletingId === transaction.id}
                      >
                        {deletingId === transaction.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}