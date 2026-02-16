// src/models/plugins/softDelete.plugin.js

module.exports = function softDeletePlugin(schema) {
  // اضافه کردن فیلد deletedAt به schema
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // ===== هوک‌های کوئری (بدون next) =====
  schema.pre("find", function () {
    this.where({ deletedAt: null });
  });

  schema.pre("findOne", function () {
    this.where({ deletedAt: null });
  });

  schema.pre("findOneAndUpdate", function () {
    this.where({ deletedAt: null });
  });

  schema.pre("updateOne", function () {
    this.where({ deletedAt: null });
  });

  schema.pre("updateMany", function () {
    this.where({ deletedAt: null });
  });

  schema.pre("countDocuments", function () {
    this.where({ deletedAt: null });
  });

  // ===== CUSTOM METHODS =====
  schema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this.deletedAt = null;
    return this.save();
  };

  schema.methods.isDeleted = function () {
    return this.deletedAt !== null;
  };

  // ===== STATIC METHODS =====
  schema.statics.findDeleted = function () {
    return this.find({ deletedAt: { $ne: null } });
  };

  schema.statics.findAllWithDeleted = function () {
    return this.find({});
  };

  schema.statics.hardDelete = function (conditions) {
    return this.deleteMany(conditions);
  };
};