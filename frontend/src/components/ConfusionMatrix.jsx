export default function ConfusionMatrix({ matrix, classNames }) {
  if (!matrix || !classNames) return null;

  const maxVal = Math.max(...matrix.flat());

  function cellBg(val, row, col) {
    if (row === col) {
      const intensity = 0.25 + (val / maxVal) * 0.75;
      return `rgba(163, 230, 53, ${intensity})`;
    }
    if (val === 0) return 'transparent';
    const intensity = 0.08 + (val / maxVal) * 0.55;
    return `rgba(239, 68, 68, ${intensity})`;
  }

  function textColor(val, row, col) {
    if (val === 0) return 'rgba(255,255,255,0.15)';
    return row === col ? '#000' : '#fff';
  }

  return (
    <div className="cm-wrap">
      <div className="cm-scroll">
        <table className="cm-table">
          <thead>
            <tr>
              <th className="cm-corner">Real ↓ / Pred →</th>
              {classNames.map(n => <th key={n} className="cm-head">{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="cm-row-label">{classNames[i]}</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className="cm-cell"
                    style={{ backgroundColor: cellBg(val, i, j) }}
                    title={`Real: ${classNames[i]} | Pred: ${classNames[j]} | n=${val}`}
                  >
                    <span style={{ color: textColor(val, i, j), fontWeight: i === j ? 700 : 400 }}>
                      {val}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
