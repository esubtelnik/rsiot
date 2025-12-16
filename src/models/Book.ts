import { readMyData } from "../utils/fileStorage";
import { LinkManager } from "./LinkManager";

export enum Genre {
   Fiction = "Fiction",
   NonFiction = "Non-Fiction",
   Mystery = "Mystery",
   SciFi = "Sci-Fi",
   Fantasy = "Fantasy",
   Biography = "Biography",
   History = "History",
   Romance = "Romance",
   Thriller = "Thriller",
   Horror = "Horror",
   Poetry = "Poetry",
   Drama = "Drama",
   Comics = "Comics",
   Other = "Other",
}

export enum BookStatus {
   AVAILABLE = "available",
   BORROWED = "borrowed",
}

export interface Book {
   id: string;
   title: string;
   author: string;
   pages: number;
   year: number;
   genre: Genre;
   status: BookStatus;
}

export class BookLinkManager extends LinkManager<Book> {
   protected fileName = "books.sea";
   protected tableName = "books";


   async findAvailable(): Promise<Book[]> {
      const books = await readMyData<Book>(this.fileName);
      return books.filter((b) => b.status === BookStatus.AVAILABLE);
   }
}

export const bookLinkManager = new BookLinkManager(); 


export interface CreateBookRequest {
   title: string;
   author: string;
   pages: number;
   year: number;
   genre: Genre;
}

export interface BorrowBookRequest {
   bookIds: string[];
   visitorId: string;
   employeeId: string;
   borrowDate: string;
}

export interface ReturnBookRequest {
   bookIds: string[];
   visitorId: string;
   employeeId: string;
   returnDate: string;
}

