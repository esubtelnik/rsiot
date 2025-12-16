import { readMyData } from "../utils/fileStorage";
import { Book, bookLinkManager } from "./Book";
import { Link } from "./Link";
import { LinkManager } from "./LinkManager";

export interface Visitor {
   id: string;
   name: string;
   surname: string;
   registrationDate: string;
   currentBooks: Link[];
   history: Link[];
}

export class VisitorLinkManager extends LinkManager<Visitor> {
   protected fileName = "visitors.sea";
   protected tableName = "visitors";

   async enrichWithBooks(visitor: Visitor): Promise<VisitorWithBooks> {

      const currentBooks = await bookLinkManager.resolveMany(visitor.currentBooks);
      const history = await bookLinkManager.resolveMany(visitor.history);

      return {
         id: visitor.id,
         name: visitor.name,
         surname: visitor.surname,
         registrationDate: visitor.registrationDate,
         currentBooks,
         history,
      };
   }

   async getAllEnriched(): Promise<VisitorWithBooks[]> {
      const visitors = await readMyData<Visitor>(this.fileName);
      return await Promise.all(
         visitors.map((v) => this.enrichWithBooks(v))
      );
   }
}

export const visitorLinkManager = new VisitorLinkManager(); 

export interface VisitorWithBooks extends Omit<Visitor, 'currentBooks' | 'history'> {
   currentBooks: Book[];
   history: Book[];
}

export interface CreateVisitorRequest {
   name: string ;
   surname: string;
   registrationDate: string;
}
