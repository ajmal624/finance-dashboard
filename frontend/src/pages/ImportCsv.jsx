import { useState } from "react";
import api from "../api";

export default function ImportCsv() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setMessage("");
    setError("");

    if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      setFile(null);
      event.target.value = "";
    }
  }

  function getErrorMessage(requestError) {
    const data = requestError?.response?.data;

    if (!data) {
      return "Unable to connect to the server. Please try again.";
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
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

    return "Import failed. Check the CSV format and try again.";
  }

  async function submit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a valid CSV file.");
      return;
    }

    const data = new FormData();
    data.append("file", file);

    try {
      setLoading(true);

      const response = await api.post(
        "dashboard/import-csv/",
        data
      );

      setMessage(
        response.data?.message ||
          "Transactions imported successfully."
      );

      setFile(null);

      const fileInput = document.getElementById("csv-file");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (requestError) {
      console.error("CSV import error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
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

        <pre>
{`date,description,amount,type,category
2026-09-01,Monthly Salary,50000,income,Salary
2026-09-02,Supermarket,1250.50,expense,Food
2026-09-03,Metro Card,300,expense,Transport`}
        </pre>

        <form className="upload-form" onSubmit={submit}>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={loading}
          />

          {file && (
            <p>
              Selected file: <strong>{file.name}</strong>
            </p>
          )}

          <button type="submit" disabled={loading || !file}>
            {loading ? "Importing..." : "Import transactions"}
          </button>
        </form>

        {message && <p className="success">{message}</p>}

        {error && <div className="error">{error}</div>}
      </div>
    </section>
  );
}