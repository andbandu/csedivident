import { InsertDividend } from "@shared/schema";

export async function importFromGoogleSheets(spreadsheetId: string): Promise<InsertDividend[]> {
  try {
    const response = await fetch(`/api/sheets/import?id=${spreadsheetId}`);
    if (!response.ok) {
      throw new Error("Failed to import from Google Sheets");
    }
    return await response.json();
  } catch (error) {
    console.error("Error importing from Google Sheets:", error);
    throw error;
  }
}
