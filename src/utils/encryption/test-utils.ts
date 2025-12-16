import { encryptData, decryptData } from "./core";

export async function testEncryption(testData: string): Promise<void> {
   console.log("=== Тест системы шифрования ===");
   console.log("Исходные данные:", testData);
   console.log("Длина:", testData.length);

   const encrypted = await encryptData(testData);
   console.log("\nЗашифрованные данные:", encrypted.substring(0, 100) + "...");
   console.log("Длина зашифрованных:", encrypted.length);

   const decrypted = await decryptData(encrypted);
   console.log("\nРасшифрованные данные:", decrypted);
   console.log("Совпадение:", testData === decrypted ? "✓ ДА" : "✗ НЕТ");
}
