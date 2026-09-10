import { useEffect, useState } from "react";
import api from "../api";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    month: new Date().toISOString().slice(0, 7) + "-01",
    limit: "",
  });

  async function loadData() {
    const [budgetResponse, categoryResponse] = await Promise.all([
      api.get("budgets/"),
      api.get("categories/"),
    ]);

    setBudgets(budgetResponse.data);
    setCategories(categoryResponse.data.filter((item) => item.type === "expense"));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api.post("budgets/", form);
    setForm({ ...form, category: "", limit: "" });
    loadData();
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Budgets</h1>
          <p>Set monthly spending limits by category.</p>
        </div>
      </div>

      <form className="form-grid card" onSubmit={submit}>
        <h2>Create budget</h2>

        <select
          required
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
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
          value={form.month}
          onChange={(event) => setForm({ ...form, month: event.target.value })}
        />

        <input
          type="number"
          step="0.01"
          required
          placeholder="Monthly limit"
          value={form.limit}
          onChange={(event) => setForm({ ...form, limit: event.target.value })}
        />

        <button type="submit">Create budget</button>
      </form>

      <div className="budget-grid">
        {budgets.map((budget) => {
          const percent = Math.min(
            100,
            (Number(budget.spent) / Number(budget.limit)) * 100
          );

          return (
            <article className="card budget-card" key={budget.id}>
              <div className="row-between">
                <h2>{budget.category_name}</h2>
                <span>{Math.round(percent)}%</span>
              </div>

              <p>
                ₹{Number(budget.spent).toLocaleString("en-IN")} spent of ₹
                {Number(budget.limit).toLocaleString("en-IN")}
              </p>

              <div className="progress-track">
                <div
                  className={percent >= 100 ? "progress-bar over" : "progress-bar"}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}