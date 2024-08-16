import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import {User} from "../models/userSchema.js";
import ErrorHandler from "./errorMiddleware.js";


export const isAdminAuthenticated=catchAsyncErrors(async(req,res,next)=>{
  const token=req.cookies.AdminToken;
  if(!token){
    return next(new ErrorHandler("ADMIN NOT AUTHENTICATED", 400));
      

  }
  const decoded=jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user=await User.findById(decoded.id);
  if(req.user.role!=="Admin"){
    return next(new ErrorHandler(`${req.user.role} not authorised for this resource`, 403));
  }
  next();
});

export const isPatientAuthenticated=catchAsyncErrors(async(req, res, next)=>{
  const token=req.cookies.PatientToken;
  if(!token){
    return next(new ErrorHandler("PATIENT NOT AUTHENTICATED", 400));
  }
  const decoded=jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user=await User.findById(decoded.id);
  if(req.user.role!=="Patient"){
    return next(new ErrorHandler(`${req.user.role} not authorised for this resource`, 403));
  }
  next();
});