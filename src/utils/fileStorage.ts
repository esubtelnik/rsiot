import { promises as fs } from "fs";
import path from "path";
import { Link } from "../models/Link";
import { decryptData, encryptData } from "./encryption";

// Use path relative to project root, works in both dev and production
const dataDir = path.join(process.cwd(), "src/data/encrypted/");

function parseMyFormat(content: string): any[] {
   if (!content.trim()) return [];

   return content
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
         const obj: any = {};

         line.split(";").forEach((pair) => {
            if (!pair.trim()) return;

            const [key, ...valueParts] = pair.split("=");
            const value = valueParts.join("=");

            if (key && value !== undefined) {
               obj[key.trim()] = convertValue(value.trim());
            }
         });

         return obj;
      });
}

function convertValue(value: string): any {
   if (value === "null" || value === "undefined") {
      return null;
   }

   if (value === "true") return true;
   if (value === "false") return false;

   if (!isNaN(Number(value)) && value !== "") {
      return Number(value);
   }

   if (value.startsWith("[") && value.endsWith("]")) {
      try {
         const parsed = JSON.parse(value);
         if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === "string" && parsed[0].includes(":")) {
               return parsed.map((str) => Link.fromString(str));
            }
         }
         return parsed;
      } catch {
         return value;
      }
   }

   if (value.startsWith("{") && value.endsWith("}")) {
      try {
         return JSON.parse(value);
      } catch {
         return value;
      }
   }

   if (value.includes(":") && !value.includes(" ")) {
      const parts = value.split(":");
      if (parts.length === 2) {
         return Link.fromString(value);
      }
   }

   return value;
}

function serializeValue(value: any): string {
   if (value === null || value === undefined) {
      return "null";
   }

   if (value instanceof Link) {
      return value.toString();
   }

   if (Array.isArray(value)) {
      if (value.length > 0 && value[0] instanceof Link) {
         const linkStrings = value.map((link) => link.toString());
         return JSON.stringify(linkStrings);
      }
      return JSON.stringify(value);
   }

   if (typeof value === "object") {
      return JSON.stringify(value);
   }

   return String(value);
}

function serializeMyFormat(data: any[]): string {
   return data
      .map((obj) => {
         return Object.entries(obj)
            .map(([key, value]) => {
               const serializedValue = serializeValue(value);
               return `${key}=${serializedValue}`;
            })
            .join(";");
      })
      .join("\n");
}

export async function readMyData<T>(filename: string): Promise<T[]> {
   const filePath = path.join(dataDir, filename);

   try {
      // Читаем зашифрованные данные
      const encryptedData = await fs.readFile(filePath, "utf-8");
      
      if (!encryptedData.trim()) {
         return [];
      }

      // Расшифровываем и декодируем
      const decryptedData = await decryptData(encryptedData);
      
      // Парсим в объекты
      return parseMyFormat(decryptedData) as T[];
   } catch (err: any) {
      if (err.code === "ENOENT") {
         await fs.writeFile(filePath, "", "utf-8");
         return [];
      }
      throw new Error(`Failed to read file ${filename}: ${err.message}`);
   }
}

export async function writeMyData<T>(
   filename: string,
   data: T[]
): Promise<void> {
   const filePath = path.join(dataDir, filename);

   try {
      // Сериализуем данные в строку
      const serialized = serializeMyFormat(data);
      
      // Кодируем и шифруем
      const encrypted = await encryptData(serialized);
      
      // Записываем зашифрованные данные
      await fs.writeFile(filePath, encrypted, "utf-8");
   } catch (err: any) {
      throw new Error(`Failed to write file ${filename}: ${err.message}`);
   }
}