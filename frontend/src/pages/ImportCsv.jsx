import { useState } from "react";
import api from "../api";

export default function ImportCsv() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      const response = await api.post("dashboard/import-csv/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
    } catch {
      setMessage("Import failed. Check the CSV format.");
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Import bank statement</h1>
          <p>Upload transactions from a CSV file.</p>
        </div>
      </div>

      <div className="card">
        <h2>Expected CSV format</h2>

        <pre>{`date,description,amount,type,category
2026-09-01,Monthly Salary,50000,income,Salary
2026-09-02,Supermarket,1250.50,expense,Food
2026-09-03,Metro Card,300,expense,Transport`}</pre>

        <form className="upload-form" onSubmit={submit}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setFile(event.target.files[0])}
          />
          <button type="submit">Import transactions</button>
        </form>

        {message && <p className="success">{message}</p>}
      </div>
    </section>
  );
}