import { useCallback, useEffect, useState } from "react";
import api from "../api";

function getInitialForm() {
  return {
    name: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    color: "#22c55e",
  };
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingMoneyId, setAddingMoneyId] = useState(null);
  const [error, setError] = useState("");

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("goals/");

      setGoals(
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || []
      );
    } catch (requestError) {
      console.error("Goals loading error:", requestError);

      setError(
        requestError.response?.data?.detail ||
          "Could not load savings goals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

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

    return "Could not complete the request. Please try again.";
  }

  async function submit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");

    const targetAmount = Number(form.target_amount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount greater than 0.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    try {
      setSaving(true);

      await api.post("goals/", {
        name: form.name.trim(),
        target_amount: form.target_amount,
        current_amount: "0",
        target_date: form.target_date || null,
        color: form.color,
      });

      setForm(getInitialForm());

      await loadGoals();
    } catch (requestError) {
      console.error("Create goal error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function addMoney(goal) {
    const amount = window.prompt(`Add money to ${goal.name}:`);

    if (amount === null || amount.trim() === "") {
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const currentAmount = Number(goal.current_amount || 0);
    const newAmount = currentAmount + numericAmount;

    try {
      setAddingMoneyId(goal.id);
      setError("");

      await api.patch(`goals/${goal.id}/`, {
        current_amount: newAmount.toFixed(2),
      });

      await loadGoals();
    } catch (requestError) {
      console.error("Add money error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setAddingMoneyId(null);
    }
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getProgress(goal) {
    const target = Number(goal.target_amount || 0);
    const current = Number(goal.current_amount || 0);

    if (target <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (current / target) * 100));
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Savings goals</h1>
          <p>Track progress toward the things you care about.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="form-grid card" onSubmit={submit}>
        <h2>Create a savings goal</h2>

        <input
          required
          name="name"
          maxLength="150"
          placeholder="Goal name"
          value={form.name}
          onChange={handleChange}
          disabled={saving}
        />

        <input
          required
          name="target_amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Target amount"
          value={form.target_amount}
          onChange={handleChange}
          disabled={saving}
        />

        <input
          name="target_date"
          type="date"
          value={form.target_date}
          onChange={handleChange}
          disabled={saving}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create goal"}
        </button>
      </form>

      <div className="goal-grid">
        {loading ? (
          <p>Loading savings goals...</p>
        ) : goals.length === 0 ? (
          <div className="card">
            <p>No savings goals yet. Create your first goal above.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = getProgress(goal);

            return (
              <article className="card" key={goal.id}>
                <div className="row-between">
                  <h2>{goal.name}</h2>

                  <button
                    type="button"
                    onClick={() => addMoney(goal)}
                    disabled={addingMoneyId === goal.id}
                  >
                    {addingMoneyId === goal.id
                      ? "Adding..."
                      : "Add money"}
                  </button>
                </div>

                <p>
                  ₹{formatAmount(goal.current_amount)} of ₹
                  {formatAmount(goal.target_amount)}
                </p>

                {goal.target_date && (
                  <p>Target date: {goal.target_date}</p>
                )}

                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: goal.color || "#22c55e",
                    }}
                  />
                </div>

                <strong>
                  {Number(progress).toFixed(1)}% complete
                </strong>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}