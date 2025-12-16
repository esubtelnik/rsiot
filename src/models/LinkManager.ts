import { Link } from "./Link";
import { readMyData } from "../utils/fileStorage";

export abstract class LinkManager<T> {
   protected abstract fileName: string;
   protected abstract tableName: string;

   toLink(id: string): Link {
      return new Link(this.tableName, id);
   }

   async resolve(link: Link): Promise<T | null> {
      if (link.table !== this.tableName) {
         throw new Error(
            `Expected link to ${this.tableName}, got ${link.table}`
         );
      }

      const items = await readMyData<T>(this.fileName);
      return items.find((item: any) => item.id === link.id) || null;
   }

   async resolveMany(links: Link[]): Promise<T[]> {
      if (!links || links.length === 0) return [];
      
      const results = await Promise.all(
         links.map((link) => this.resolve(link))
      );

      return results.filter((item): item is NonNullable<typeof item> => item !== null) as T[];
   }
}