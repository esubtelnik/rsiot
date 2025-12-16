import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes";
import swaggerDocument from "./swagger.json";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import cors from "cors";

// import { testEncryption } from "./utils/encryption";
// testEncryption(
//    'id=69383be7-6547-4777-bb86-7611a99a7e64;name=Katusha;surname=Subtelnik;registrationDate=2025-12-02;currentBooks=["books:2731f7e6-8fd2-41d6-aee3-d28ff900acdc"];history=["books:4a28fe7c-2372-46cc-a416-64453e51bae4","books:0ce72073-6597-45e2-923d-c2aa7da7fcc4","books:4a28fe7c-2372-46cc-a416-64453e51bae4","books:9712915e-c67c-437b-a996-30788211e23d"]'
// );

const app = express();
app.use(express.json());

app.use(cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
   if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
         successful: false,
         error: {
            message: "Invalid JSON",
            statusCode: 400,
            code: "INVALID_JSON",
         },
      });
   }
   next(err);
});

const router = express.Router();
RegisterRoutes(router);
app.use("/api", router);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFoundHandler);
app.use(errorHandler);

// const PORT = 5000;
// app.listen(PORT, () => {
//    console.log(`🚀 Server running at http://localhost:${PORT}`);
//    console.log(`📘 Swagger docs available at http://localhost:${PORT}/docs`);
// });

module.exports = app;