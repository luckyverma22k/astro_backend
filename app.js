
import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";

import cookieParser from "cookie-parser";
import cors from "cors"
import fileUpload from "express-fileupload";
import {errorMiddleware} from './middlewares/errorMiddleware.js'
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";

const app=express();
config({path:"./config/config.env"});

console.log('Loaded environment variables:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`DASHBOARD_URL: ${process.env.DASHBOARD_URL}`);
console.log(`JWT_SECRET_KEY: ${process.env.JWT_SECRET_KEY}`);
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY}`);



app.use(cors({
    origin:[process.env.FRONTEND_URL,process.env.DASHBOARD_URL],
    methodS:["GET","POST","PUT","DELETE"],
    credentials:true 
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true})); 
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}));


app.use("/api/v1/message",messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
dbConnection();


app.use(errorMiddleware);
export default app;
