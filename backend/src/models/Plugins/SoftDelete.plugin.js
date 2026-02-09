// src/models/plugins/softDelete.plugin.js
module.exports = function softDeletePlugin(schema) {
  schema.add({
    deletedAt: { type: Date, default: null }
  });

  schema.index({ deletedAt: 1 });

  const excludeDeleted = function () {
    if (!this.getQuery().withDeleted) {
      this.where({ deletedAt: null });
    }
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);

  schema.statics.softDeleteById = function (id) {
    return this.findByIdAndUpdate(id, { deletedAt: new Date() });
  };

  schema.statics.restoreById = function (id) {
    return this.findByIdAndUpdate(id, { deletedAt: null });
  };

  schema.statics.findWithDeleted = function (filter = {}) {
    return this.find({ ...filter, withDeleted: true });
  };
};
