import {
   Controller,
   Get,
   Route,
   Tags,
   Post,
   Body,
   Path,
   Delete,
   Patch,
} from "tsoa";
import { Visitor, CreateVisitorRequest, VisitorWithBooks } from "../models/Visitor";
import { readMyData, writeMyData } from "../utils/fileStorage";
import { wrapResponse, ApiResponse } from "../utils/responseWrapper";
import { ValidationError, NotFoundError } from "../utils/apiErrors";
import { v4 as uuidv4 } from "uuid";
import { VisitorValidator } from "../validators/visitorValidator";
import { visitorLinkManager } from "../models/Visitor"; 

@Route("visitors")
@Tags("Visitors")
export class VisitorController extends Controller {
   private readonly file = "visitors.sea";

   @Get("/")
   public async getVisitors(): Promise<ApiResponse<VisitorWithBooks[]>> {
      const visitors = await readMyData<Visitor>(this.file);
      
      const enriched = await Promise.all(
         visitors.map((v) => visitorLinkManager.enrichWithBooks(v))
      );

      return wrapResponse(enriched);
   }

   @Get("/{id}")
   public async getVisitor(@Path() id: string): Promise<ApiResponse<VisitorWithBooks>> {
      const visitors = await readMyData<Visitor>(this.file);
      const visitor = visitors.find((v) => v.id === id);

      if (!visitor) {
         throw new NotFoundError(`Visitor with id ${id} not found`);
      }

      const enriched = await visitorLinkManager.enrichWithBooks(visitor);
      return wrapResponse(enriched);
   }

   @Post("/")
   public async addVisitor(
      @Body() body: CreateVisitorRequest
   ): Promise<ApiResponse<Visitor>> {
      VisitorValidator.validate(body);

      const visitors = await readMyData<Visitor>(this.file);

      const newVisitor: Visitor = {
         id: uuidv4(),
         name: body.name.trim(),
         surname: body.surname.trim(),
         registrationDate: body.registrationDate,
         currentBooks: [],
         history: [],
      };

      visitors.push(newVisitor);
      await writeMyData(this.file, visitors);

      return wrapResponse(newVisitor);
   }

   @Patch("/{id}")
   public async updateVisitor(
      @Path() id: string,
      @Body() body: Partial<CreateVisitorRequest>
   ): Promise<ApiResponse<VisitorWithBooks>> {
      VisitorValidator.validateForUpdate(body);

      const visitors = await readMyData<Visitor>(this.file);
      const index = visitors.findIndex((v) => v.id === id);

      if (index === -1) {
         throw new NotFoundError(`Visitor with id ${id} not found`);
      }

      visitors[index] = { ...visitors[index], ...body };
      await writeMyData(this.file, visitors);

      const enriched = await visitorLinkManager.enrichWithBooks(visitors[index]);
      return wrapResponse(enriched);
   }

   @Delete("/{id}")
   public async deleteVisitor(@Path() id: string): Promise<ApiResponse<void>> {
      const visitors = await readMyData<Visitor>(this.file);
      const index = visitors.findIndex((v) => v.id === id);

      if (index === -1) {
         throw new NotFoundError(`Visitor with id ${id} not found`);
      }

      if (
         visitors[index].currentBooks &&
         visitors[index].currentBooks.length > 0
      ) {
         throw new ValidationError(
            "Cannot delete visitor with unreturned books"
         );
      }

      visitors.splice(index, 1);
      await writeMyData(this.file, visitors);

      return wrapResponse();
   }
}