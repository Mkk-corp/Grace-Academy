export default function AdminTableSkeleton({ cols = 3, rows = 5 }) {
  const widths = ['55%', '35%', '25%', '20%']
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="skeleton-row">
      {Array.from({ length: cols }).map((_, c) => (
        <td key={c}>
          <span className="skeleton skeleton-field" style={{ width: widths[c] || '30%' }} />
        </td>
      ))}
    </tr>
  ))
}
