// Helper buat bikin pembatas "per minggu" & "per bulan" di tabel.
// Minggu dihitung Senin - Minggu (ISO-ish, tapi simpel pakai Date bawaan JS, gak perlu library tambahan).

const MONTH_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return `${MONTH_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Minggu ... 6 = Sabtu
  const diff = day === 0 ? -6 : 1 - day; // geser mundur ke hari Senin
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function weekKey(dateStr) {
  return startOfWeek(dateStr).toISOString().slice(0, 10);
}

export function weekLabel(dateStr) {
  const start = startOfWeek(dateStr);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => `${d.getDate()} ${MONTH_ID[d.getMonth()].slice(0, 3)}`;
  return `Minggu ${fmt(start)} - ${fmt(end)}`;
}

// Ubah list rows (udah terurut, terbaru duluan) jadi list item campuran:
// divider bulan, divider minggu, dan row data - siap dirender langsung ke <tbody>.
export function buildGroupedItems(rows) {
  const items = [];
  let lastMonth = null;
  let lastWeek = null;

  rows.forEach((row, idx) => {
    if (!row.date) {
      items.push({ type: "row", data: row, no: idx + 1 });
      return;
    }
    const mKey = monthKey(row.date);
    const wKey = weekKey(row.date);

    if (mKey !== lastMonth) {
      items.push({ type: "month", key: `m-${mKey}`, label: monthLabel(row.date) });
      lastMonth = mKey;
      lastWeek = null; // biar divider minggu ikut muncul lagi tepat setelah ganti bulan
    }
    if (wKey !== lastWeek) {
      items.push({ type: "week", key: `w-${wKey}`, label: weekLabel(row.date) });
      lastWeek = wKey;
    }
    items.push({ type: "row", data: row, no: idx + 1 });
  });

  return items;
}
