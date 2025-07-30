export const changesDetector=(oldData: any, newData: any)=> {
  const changes = {};

  for (const key of Object.keys(newData)) {
    const oldVal = oldData[key];
    const newVal = newData[key];

    // Gérer les dates
    const isDate = (val: any) => val instanceof Date || !isNaN(Date.parse(val));
    const normalizeDate = (val: any) => isDate(val) ? new Date(val).toISOString() : val;

    const normalizedOld = normalizeDate(oldVal);
    const normalizedNew = normalizeDate(newVal);

    if (normalizedOld !== normalizedNew) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }

  return changes;
}
