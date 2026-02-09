const AuditService = require("./audit.service");
const { getDiff } = require("../../utils/diff.util");

exports.audit = ({ action, entity, getEntityId, model }) => {
  if (!action || !entity) {
    throw new Error("Audit middleware requires 'action' and 'entity'");
  }

  return async (req, res, next) => {
    const resolveId = () =>
      typeof getEntityId === "function" ? getEntityId(req, res) : null;

    let oldValue = null;
    const idBefore = resolveId();

    // گرفتن مقدار قدیمی قبل از تغییر
    if (model && idBefore) {
      try {
        oldValue = await model.findById(idBefore).lean();
      } catch (err) {
        console.error("Audit fetchOldValue error:", err.message);
      }
    }

    res.on("finish", async () => {
      if (res.statusCode >= 400) return; // فقط عملیات موفق
      if (!req.user?._id) return;

      const idAfter = resolveId();

      let newValue = null;

      // اگر Controller مقدار جدید داده باشد
      if (req.createdUserDoc) {
        newValue = req.createdUserDoc;
      }

      // اگر مسیر دیگری است (update, deactivate) → دوباره از دیتابیس بخوان
      else if (model && idAfter) {
        try {
          newValue = await model.findById(idAfter).lean();
        } catch (err) {
          console.error("Audit fetchNewValue error:", err.message);
        }
      }

      // محاسبه تغییرات
      const changes = getDiff(oldValue, newValue);

      try {
        await AuditService.log({
          actor: req.user._id,
          action,
          entityType: entity,
          entityId: idAfter,
          oldValue,
          newValue,
          changes,
          req,
        });
      } catch (err) {
        console.error("AuditService.log error:", err.message);
      }
    });

    next();
  };
};
