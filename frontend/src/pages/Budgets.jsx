import { useCallback, useEffect, useState } from "react";
import api from "../api";

function getInitialForm() {
  return {
    category: "",
    month: `${new Date().toISOString().slice(0, 7)}-01`,
    limit: "",
  };
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, categoryResponse] = await Promise.all([
        api.get("budgets/"),
        api.get("categories/"),
      ]);

      const budgetData = Array.isArray(budgetResponse.data)
        ? budgetResponse.data
        : budgetResponse.data?.results || [];

      const categoryData = Array.isArray(categoryResponse.data)
        ? categoryResponse.data
        : categoryResponse.data?.results || [];

      setBudgets(budgetData);
      setCategories(
        categoryData.filter((item) => item.type === "expense")
      );
    } catch (requestError) {
      console.error("Budgets loading error:", requestError);

      setError(
        requestError.response?.data?.detail ||
          "Could not load budgets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getErrorMessage(requestError) {
    const data = requestError?.response?.data;

    if (!data) {
      return "Unable to connect to the server. Please try again.";
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {
      const messages = [];

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
          messages.push(`${field}: ${value}`);
        }
      });

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return "Could not create the budget. Please check your details.";
  }

  async function submit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");

    const limit = Number(form.limit);

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Please enter a valid monthly limit greater than 0.");
      return;
    }

    if (!form.category) {
      setError("Please select an expense category.");
      return;
    }

    try {
      setSaving(true);

      await api.post("budgets/", {
        category: Number(form.category),
        month: form.month,
        limit: form.limit,
      });

      setForm(getInitialForm());

      await loadData();
    } catch (requestError) {
      console.error("Create budget error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
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
          <h1>Budgets</h1>
          <p>Set monthly spending limits by category.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="form-grid card" onSubmit={submit}>
        <h2>Create budget</h2>

        <select
          required
          name="category"
          value={form.category}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="">Select expense category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          required
          name="month"
          value={form.month}
          onChange={handleChange}
          disabled={saving}
        />

        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          name="limit"
          placeholder="Monthly limit"
          value={form.limit}
          onChange={handleChange}
          disabled={saving}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create budget"}
        </button>
      </form>

      <div className="budget-grid">
        {loading ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="card">
            <p>No budgets yet. Create your first monthly budget above.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const limit = Number(budget.limit || 0);
            const spent = Number(budget.spent || 0);

            const percent =
              limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

            const isOverBudget = limit > 0 && spent >= limit;

            return (
              <article
                className="card budget-card"
                key={budget.id}
              >
                <div className="row-between">
                  <h2>{budget.category_name}</h2>
                  <span>{Math.round(percent)}%</span>
                </div>

                <p>
                  ₹{formatAmount(spent)} spent of ₹{formatAmount(limit)}
                </p>

                <div className="progress-track">
                  <div
                    className={
                      isOverBudget
                        ? "progress-bar over"
                        : "progress-bar"
                    }
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}