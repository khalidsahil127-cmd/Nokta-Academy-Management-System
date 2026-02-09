exports.getDiff = (oldObj, newObj) => {

  const changes = {};
  if (!oldObj || !newObj) return changes;
  Object.keys(newObj).forEach(key => {
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = {
        old: oldVal,
        new: newVal
      };

    }

  });

  return changes;
};
