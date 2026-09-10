import { useEffect, useState } from "react";
import api from "../api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    color: "#22c55e",
  });

  async function loadGoals() {
    const response = await api.get("goals/");
    setGoals(response.data);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api.post("goals/", form);

    setForm({
      name: "",
      target_amount: "",
      current_amount: "0",
      target_date: "",
      color: "#22c55e",
    });

    loadGoals();
  }

  async function addMoney(goal) {
    const amount = window.prompt(`Add money to ${goal.name}:`);

    if (!amount || Number(amount) <= 0) return;

    await api.patch(`goals/${goal.id}/`, {
      current_amount: Number(goal.current_amount) + Number(amount),
    });

    loadGoals();
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Savings goals</h1>
          <p>Track progress toward the things you care about.</p>
        </div>
      </div>

      <form className="form-grid card" onSubmit={submit}>
        <h2>Create a savings goal</h2>

        <input
          required
          placeholder="Goal name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />

        <input
          required
          type="number"
          placeholder="Target amount"
          value={form.target_amount}
          onChange={(event) =>
            setForm({ ...form, target_amount: event.target.value })
          }
        />

        <input
          type="date"
          value={form.target_date}
          onChange={(event) =>
            setForm({ ...form, target_date: event.target.value })
          }
        />

        <button type="submit">Create goal</button>
      </form>

      <div className="goal-grid">
        {goals.map((goal) => (
          <article className="card" key={goal.id}>
            <div className="row-between">
              <h2>{goal.name}</h2>
              <button onClick={() => addMoney(goal)}>Add money</button>
            </div>

            <p>
              ₹{Number(goal.current_amount).toLocaleString("en-IN")} of ₹
              {Number(goal.target_amount).toLocaleString("en-IN")}
            </p>

            {goal.target_date && <p>Target date: {goal.target_date}</p>}

            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(goal.progress_percentage, 100)}%`,
                  backgroundColor: goal.color,
                }}
              />
            </div>

            <strong>{goal.progress_percentage}% complete</strong>
          </article>
        ))}
      </div>
    </section>
  );
}