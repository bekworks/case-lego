import type { Colour, SetDetailPiece } from "@/domain/model";

export const SetPiecesTable = ({
  pieces,
  colours,
  missingOnly = false,
}: {
  pieces: ReadonlyArray<SetDetailPiece>;
  colours: ReadonlyArray<Colour>;
  missingOnly?: boolean;
}) => {
  const names = new Map(colours.map((c) => [c.colourCode, c.name]));
  const rows = [...pieces].sort(
    (a, b) =>
      (missingOnly ? b.missing - a.missing : 0) ||
      a.pieceId.localeCompare(b.pieceId, undefined, { numeric: true }) ||
      a.colourCode - b.colourCode,
  );

  return (
    <div className="overflow-x-auto rounded border border-line bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-muted">
          <tr>
            <th className="px-4 py-2.5 font-bold">Piece</th>
            <th className="px-4 py-2.5 font-bold">Colour</th>
            <th className="px-4 py-2.5 text-right font-bold">Needed</th>
            <th className="px-4 py-2.5 text-right font-bold">You have</th>
            {missingOnly && (
              <th className="px-4 py-2.5 text-right font-bold">Missing</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map((p) => (
            <tr key={`${p.pieceId}-${p.colourCode}`}>
              <td className="px-4 py-2 font-bold text-ink tabular-nums">
                {p.pieceId}
              </td>
              <td className="px-4 py-2">
                {names.get(p.colourCode) ?? String(p.colourCode)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums">
                {p.quantity}
              </td>
              <td className="px-4 py-2 text-right tabular-nums">{p.owned}</td>
              {missingOnly && (
                <td className="px-4 py-2 text-right font-bold text-ink tabular-nums">
                  {p.missing}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
