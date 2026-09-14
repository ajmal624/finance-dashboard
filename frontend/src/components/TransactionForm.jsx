import { useState } from "react";
import api from "../api";

function getInitialForm() {
  return {
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function TransactionForm({ categories = [], onCreated }) {
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const relevantCategories = categories.filter(
    (category) => category.type === form.type
  );

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

    return "Could not save the transaction. Please check your details.";
  }

  async function submit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      await api.post("transactions/", {
        type: form.type,
        category: Number(form.category),
        amount: form.amount,
        description: form.description.trim(),
        date: form.date,
      });

      setForm(getInitialForm());

      if (onCreated) {
        await onCreated();
      }
    } catch (requestError) {
      console.error("Create transaction error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(event) {
    setForm((current) => ({
      ...current,
      type: event.target.value,
      category: "",
    }));
    setError("");
  }

  return (
    <form className="form-grid card" onSubmit={submit}>
      <h2>Add transaction</h2>

      {error && <div className="error">{error}</div>}

      <select
        name="type"
        value={form.type}
        onChange={handleTypeChange}
        disabled={loading}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <select
        required
        name="category"
        value={form.category}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="">Select category</option>

        {relevantCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        required
        name="amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        disabled={loading}
      />

      <input
        required
        name="description"
        type="text"
        maxLength="255"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        disabled={loading}
      />

      <input
        required
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save transaction"}
      </button>
    </form>
  );
}