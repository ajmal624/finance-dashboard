export default function StatCard({ title, value, type = "neutral" }) {
  return (
    <article className={`stat-card ${type}`}>
      <span>{title}</span>
      <strong>₹{Number(value || 0).toLocaleString("en-IN")}</strong>
    </article>
  );
}