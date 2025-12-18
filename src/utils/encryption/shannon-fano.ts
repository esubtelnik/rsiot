export interface FrequencyNode {
   char: string;
   freq: number;
   firstOccurrence: number;
}

export interface CodeTableEntry {
   char: string;
   code: string;
}

export function getFrequencies(text: string): FrequencyNode[] {
   const freqMap = new Map<string, { freq: number; firstOccurrence: number }>();

   for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (!freqMap.has(char)) {
         freqMap.set(char, { freq: 0, firstOccurrence: i });
      }
      freqMap.get(char)!.freq++;
   }

   const nodes: FrequencyNode[] = [];
   freqMap.forEach((value, char) => {
      nodes.push({
         char,
         freq: value.freq,
         firstOccurrence: value.firstOccurrence,
      });
   });
   
   nodes.sort((a, b) => {
      if (b.freq !== a.freq) {
         return b.freq - a.freq;
      }
      return a.firstOccurrence - b.firstOccurrence;
   });

   return nodes;
}

export function buildShannonFanoTree(
   nodes: FrequencyNode[],
   codeTable: Map<string, string>,
   prefix: string = ""
): void {
   if (nodes.length === 0) return;

   if (nodes.length === 1) {
      codeTable.set(nodes[0].char, prefix || "0");
      return;
   }

   const totalFreq = nodes.reduce((sum, node) => sum + node.freq, 0);
   const halfFreq = totalFreq / 2;

   let leftSum = 0;
   let splitIndex = 0;

   for (let i = 0; i < nodes.length; i++) {
      leftSum += nodes[i].freq;

      if (leftSum >= halfFreq) {
         const leftSumWithout = leftSum - nodes[i].freq;
         const diffWith = Math.abs(leftSum - halfFreq);
         const diffWithout = Math.abs(leftSumWithout - halfFreq);

         if (diffWith <= diffWithout) {
            splitIndex = i + 1;
         } else {
            splitIndex = i;
         }
         break;
      }
   }

   if (splitIndex === 0) {
      splitIndex = nodes.length - 1;
   }

   const leftNodes = nodes.slice(0, splitIndex);
   const rightNodes = nodes.slice(splitIndex);

   buildShannonFanoTree(leftNodes, codeTable, prefix + "0");
   buildShannonFanoTree(rightNodes, codeTable, prefix + "1");
}

export function shannonFanoEncode(text: string): { encoded: string; table: CodeTableEntry[] } {
   if (!text) return { encoded: "", table: [] };

   const frequencies = getFrequencies(text);
   const codeTable = new Map<string, string>();

   buildShannonFanoTree(frequencies, codeTable);

   let encoded = "";
   for (const char of text) {
      const code = codeTable.get(char);
      if (!code) {
         console.error(`Character '${char}' (code: ${char.charCodeAt(0)}) not found in the code table!`);
      }
      encoded += code || "";
   }

   const table: CodeTableEntry[] = [];
   codeTable.forEach((code, char) => {
      table.push({ char, code });
   });

   return { encoded, table };
}

export function shannonFanoDecode(encoded: string, table: CodeTableEntry[]): string {
   if (!encoded || table.length === 0) return "";

   const invalidEntries = table.filter(e => !e.char || !e.code);
   if (invalidEntries.length > 0) {
      console.error("Found invalid entries in the table:", invalidEntries);
   }

   const reverseTable = new Map<string, string>();
   table.forEach(({ char, code }) => {
      if (char && code) {
         if (reverseTable.has(code)) {
            console.error(`Duplicate code '${code}' for characters '${reverseTable.get(code)}' and '${char}'`);
         }
         reverseTable.set(code, char);
      }
   });

   console.log("Size of the reverse table:", reverseTable.size);
   console.log("Length of the encoded string:", encoded.length);

   let decoded = "";
   let currentCode = "";
   let position = 0;

   for (const bit of encoded) {
      currentCode += bit;
      position++;
      
      if (reverseTable.has(currentCode)) {
         const char = reverseTable.get(currentCode)!;
         decoded += char;
         currentCode = "";
      }
      
      if (currentCode.length > 20) {
         console.error(`Too long code at position ${position}: '${currentCode}'`);
         console.error(`Decoded up to this point: '${decoded}'`);
         break;
      }
   }

   if (currentCode.length > 0) {
      console.error(`Unprocessed code: '${currentCode}' (length: ${currentCode.length})`);
      console.error("Available codes in the table:", Array.from(reverseTable.keys()).slice(0, 10));
   }

   return decoded;
}