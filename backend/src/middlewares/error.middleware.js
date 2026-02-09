const AppError = require("../utils/app.error");


//Global error handling middleware
module.exports = (err, req, res, next) => {
  console.error('💥 ERROR:', err);

  //Mongoos duplicate key
  if(err.code === 11000){
    err = new AppError("Duplicate field value", 400);
  };

  //Mongoos validation error
  if(err.name === "ValidationError") {
    err = new AppError(err.message, 400);
  }

  //Mongoose cast error (invalid onjectId)
  if(err.name === "CastError") {
    err = new AppError("Invalid ID format", 400);
  }

  //Unknown error
  if(!err.isOperational) {
    err = new AppError("Somthing went wrong", 500);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  });

};
