import {
   Controller,
   Get,
   Route,
   Tags,
   Post,
   Body,
   Patch,
   Delete,
   Path,
} from "tsoa";
import {
   Book,
   BookStatus,
   BorrowBookRequest,
   CreateBookRequest,
   ReturnBookRequest,
} from "../models/Book";
import { readMyData, writeMyData } from "../utils/fileStorage";
import { wrapResponse, ApiResponse } from "../utils/responseWrapper";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, BadRequestError } from "../utils/apiErrors";
import { BookValidator } from "../validators/bookValidator";
import { Visitor } from "../models/Visitor";
import { Employee } from "../models/Employee";
import { DateUtils } from "../utils/dateUtils";
import { bookLinkManager } from "../models/Book";
import { Link } from "../models/Link";

@Route("books")
@Tags("Books")
export class BookController extends Controller {
   private file = "books.sea";
   private visitorsFile = "visitors.sea";
   private employeesFile = "employees.sea";

   @Get("/")
   public async getBooks(): Promise<ApiResponse<Book[]>> {
      const books = await readMyData<Book>(this.file);
      return wrapResponse(books);
   }

   @Post("/")
   public async addBook(
      @Body() body: CreateBookRequest
   ): Promise<ApiResponse<Book>> {
      BookValidator.validate(body);

      const books = await readMyData<Book>(this.file);
      const newBook: Book = {
         id: uuidv4(),
         ...body,
         status: BookStatus.AVAILABLE,
      };
      books.push(newBook);

      await writeMyData(this.file, books);

      return wrapResponse(newBook);
   }

   @Get("/{id}")
   public async getBook(id: string): Promise<ApiResponse<Book>> {
      const books = await readMyData<Book>(this.file);
      const book = books.find((b) => b.id === id);

      if (!book) {
         throw new NotFoundError(`Book with id ${id} not found`);
      }

      return wrapResponse(book);
   }

   @Patch("/{id}")
   public async updateBook(
      @Path() id: string,
      @Body() body: Partial<CreateBookRequest>
   ): Promise<ApiResponse<Book>> {
      BookValidator.validateForUpdate(body);

      const books = await readMyData<Book>(this.file);
      const bookIndex = books.findIndex((b) => b.id === id);

      if (bookIndex === -1) {
         throw new NotFoundError(`Book with id ${id} not found`);
      }

      books[bookIndex] = { ...books[bookIndex], ...body };
      await writeMyData(this.file, books);

      return wrapResponse(books[bookIndex]);
   }

   @Delete("/{id}")
   public async deleteBook(
      @Path() id: string
   ): Promise<ApiResponse<{ message: string }>> {
      const books = await readMyData<Book>(this.file);
      const index = books.findIndex((b) => b.id === id);

      if (index === -1) {
         throw new NotFoundError(`Book with id ${id} not found`);
      }

      books.splice(index, 1);
      await writeMyData(this.file, books);

      return wrapResponse({
         message: `Book with id ${id} deleted successfully`,
      });
   }

   @Post("/borrow")
   public async borrowBook(
      @Body() body: BorrowBookRequest
   ): Promise<ApiResponse<{ message: string }>> {
      const books = await readMyData<Book>(this.file);
      const visitors = await readMyData<Visitor>(this.visitorsFile);
      const employees = await readMyData<Employee>(this.employeesFile);

      const visitorIndex = visitors.findIndex((v) => v.id === body.visitorId);
      if (visitorIndex === -1) {
         throw new NotFoundError(`Visitor with id ${body.visitorId} not found`);
      }

      const employee = employees.find((e) => e.id === body.employeeId);
      if (!employee) {
         throw new NotFoundError(
            `Employee with id ${body.employeeId} not found`
         );
      }

      if (!DateUtils.isWorkingDay(body.borrowDate, employee.workDays)) {
         throw new BadRequestError("Library is closed on this day");
      }

      const borrowedBooks: string[] = [];

      for (const bookId of body.bookIds) {
         const bookIndex = books.findIndex((b) => b.id === bookId);

         if (bookIndex === -1) {
            throw new NotFoundError(`Book with id ${bookId} not found`);
         }

         if (books[bookIndex].status === BookStatus.BORROWED) {
            throw new BadRequestError(
               `Book "${books[bookIndex].title}" is already borrowed`
            );
         }

         books[bookIndex].status = BookStatus.BORROWED;

            
         const bookLink = bookLinkManager.toLink(bookId);
         visitors[visitorIndex].currentBooks.push(bookLink);

         borrowedBooks.push(bookId);
      }

      await writeMyData(this.file, books);
      await writeMyData(this.visitorsFile, visitors);

      return wrapResponse({
         message: `Successfully borrowed ${borrowedBooks.length} book(s)`,
      });
   }

   @Post("/return")
   public async returnBook(
      @Body() body: ReturnBookRequest
   ): Promise<ApiResponse<{ message: string }>> {
      const books = await readMyData<Book>(this.file);
      const visitors = await readMyData<Visitor>(this.visitorsFile);
      const employees = await readMyData<Employee>(this.employeesFile);

      const visitorIndex = visitors.findIndex((v) => v.id === body.visitorId);
      if (visitorIndex === -1) {
         throw new NotFoundError(`Visitor with id ${body.visitorId} not found`);
      }

      const employee = employees.find((e) => e.id === body.employeeId);
      if (!employee) {
         throw new NotFoundError(
            `Employee with id ${body.employeeId} not found`
         );
      }

      if (!DateUtils.isWorkingDay(body.returnDate, employee.workDays)) {
         throw new BadRequestError("Library is closed on this day");
      }

      const returnedBooks: string[] = [];

      for (const bookId of body.bookIds) {
         const bookIndex = books.findIndex((b) => b.id === bookId);

         if (bookIndex === -1) {
            throw new NotFoundError(`Book with id ${bookId} not found`);
         }

         if (books[bookIndex].status === BookStatus.AVAILABLE) {
            throw new BadRequestError(
               `Book "${books[bookIndex].title}" is not borrowed`
            );
         }

         // Ищем Link объект в currentBooks
         const linkIndex = visitors[visitorIndex].currentBooks.findIndex(
            (link) => (link).id === bookId
         );

         if (linkIndex === -1) {
            throw new BadRequestError(
               `Visitor does not have book "${books[bookIndex].title}"`
            );
         }

         books[bookIndex].status = BookStatus.AVAILABLE;

         // Удаляем из currentBooks и добавляем в history как Link объект
         const bookLink = visitors[visitorIndex].currentBooks.splice(
            linkIndex,
            1
         )[0];
         visitors[visitorIndex].history.push(bookLink);

         returnedBooks.push(bookId);
      }

      await writeMyData(this.file, books);
      await writeMyData(this.visitorsFile, visitors);

      return wrapResponse({
         message: `Successfully returned ${returnedBooks.length} book(s)`,
      });
   }
}