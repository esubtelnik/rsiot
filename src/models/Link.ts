export class Link<T = any> {
    table: string;
    id: string;
 
    constructor(table: string, id: string) {
       this.table = table;
       this.id = id;
    }
 
    static fromString(linkStr: string): Link {
       const [table, id] = linkStr.split(":");
       return new Link(table, id);
    }
 
    toString(): string {
       return `${this.table}:${this.id}`;
    }
 }
