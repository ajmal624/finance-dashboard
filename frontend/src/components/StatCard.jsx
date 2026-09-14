export default function StatCard({ title, value, type = "neutral" }) {
  const formattedValue = Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <article className={`stat-card ${type}`}>
      <span>{title}</span>
      <strong>₹{formattedValue}</strong>
    </article>
  );
}