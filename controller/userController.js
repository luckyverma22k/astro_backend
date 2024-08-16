import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler  from "../middlewares/errorMiddleware.js"; 
import {User} from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import * as cloudinary from 'cloudinary';
export const patienRegister = catchAsyncErrors(async (req, res, next) => {
    const { firstName,lastName, email, phone,password,gender,dob ,nic,role, } = req.body;
      if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role) 
      {
        return next(new ErrorHandler("Please fill all fields", 400));
      }
      let user=await User.findOne({email});
      if(user){
        return next(new ErrorHandler("User already exists", 400));
      }
      user = await User.create({ firstName,lastName, email, phone,password,gender,dob ,nic,role, });
      generateToken(user, "User registered successfully", 200, res);
     
});
export const login=catchAsyncErrors(async(req,res,next)=>{
  const {email,password,confirmPassword,role}=req.body;
  if(!email||!password || !confirmPassword || !role){
    return next(new ErrorHandler("Please enter email and password",400));
  }
  if(password!=confirmPassword){
    return next(new ErrorHandler("Password does not match", 400));
  }
  const user=await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatch=await user.comparePassword(password); 
  if(!isPasswordMatch){
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  if(role!==user.role){
    return next(new ErrorHandler("Invalid role", 401));
  }
  generateToken(user, "User login successfully", 200, res);
})
export const addNewAdmin=catchAsyncErrors(async(req, res, next)=>{
  const {firstName,lastName,email,phone,password,gender,dob,nic,role}=
  req.body;

  if(!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic){
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const isRegistered=await User.findOne({email});
  if(isRegistered){
    return next(new ErrorHandler(`${isRegistered.role} with this email already exits`));
  }
  const admin=await User.create({firstName,lastName,email,
    phone,
    
    password,gender,dob,nic,role:"Admin",});

    res.status(200).json({
      success:true,
      message:"Admin added successfully",
      
    })
});
export const getAllDoctors=catchAsyncErrors(async(req, res, next)=>{
  const doctors=await User.find({role:"Doctor"});
  res.status(200).json({
    success:true,
    doctors,
  })
});
export const getUserDetails=catchAsyncErrors(async(req, res, next)=>{
  const user=req.user;
  res.status(200).json({
    success:true,
    user,
  })
});
export const logoutAdmin=catchAsyncErrors(async(req, res, next)=>{
  res.cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true,
  });
  res.status(200).cookie("AdminToken","",{
    expires:new Date(Date.now()),
    httpOnly:true, 
    secure:true,
    sameSite:"None"
  }).json({
    success:true,
    message:"Admin Logout successfully",
  })
});
export const logoutPatient=catchAsyncErrors(async(req, res, next)=>{
 
  res.status(200).cookie("PatientToken","",{
    expires:new Date(Date.now()),
    httpOnly:true,
     secure:true,
    sameSite:"None"
  }).json({
    success:true,
    message:"Patient Logout successfully",
  })
})

export const addNewDoctor=catchAsyncErrors(async(req, res, next)=>{
  if(!req.files || Object.keys(req.files).length===0){
    return next(new ErrorHandler("Doctor image is required", 400));
  }
  const {docAvatar}=req.files;
  const allowedFormats=["image/png","image/jpeg","image/webp"];
  if(!allowedFormats.includes(docAvatar.mimetype)){
    return next(new ErrorHandler("Invalid image format", 400));
  }
  const {firstName,lastName,
    email,phone,password,gender,dob,nic,doctorDepartment
  }=req.body;
  if(!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic||!doctorDepartment){
    return next(new ErrorHandler("please provide full details", 400));
  }
  const isRegistered=await User.findOne({email});
  if(isRegistered){
    return next(new ErrorHandler(`${isRegistered.role} with this email already exits`));
  } 
  const cloudinaryResponse=await cloudinary
  .uploader.upload(docAvatar.tempFilePath);
  if(!cloudinaryResponse || cloudinaryResponse.error){
   console.error("cloudinary Error:",cloudinaryResponse.error || "unknown cloudinary error"

   );
  }
  const doctor=await User.create({
    firstName,lastName,email,phone,password,gender,dob,nic
    ,doctorDepartment,role:"Doctor",
    docAvatar:{
      public_id:cloudinaryResponse.public_id,
      url:cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success:true,
    message:"Doctor added successfully",
    doctor,
  })
})