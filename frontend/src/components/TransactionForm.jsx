import { useState } from "react";
import api from "../api";

export default function TransactionForm({ categories, onCreated }) {
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const relevantCategories = categories.filter(
    (category) => category.type === form.type
  );

  async function submit(event) {
    event.preventDefault();

    await api.post("transactions/", form);

    setForm({
      type: "expense",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    });

    onCreated();
  }

  return (
    <form className="form-grid card" onSubmit={submit}>
      <h2>Add transaction</h2>

      <select
        value={form.type}
        onChange={(event) =>
          setForm({ ...form, type: event.target.value, category: "" })
        }
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <select
        required
        value={form.category}
        onChange={(event) => setForm({ ...form, category: event.target.value })}
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
        type="number"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={(event) => setForm({ ...form, amount: event.target.value })}
      />

      <input
        required
        placeholder="Description"
        value={form.description}
        onChange={(event) =>
          setForm({ ...form, description: event.target.value })
        }
      />

      <input
        required
        type="date"
        value={form.date}
        onChange={(event) => setForm({ ...form, date: event.target.value })}
      />

      <button type="submit">Save transaction</button>
    </form>
  );
}