/**
 * Google Sheets Sync Script
 * Fetches inventory data from Google Sheets and saves it as JSON
 *
 * Required secrets in GitHub:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: The email of your Google Cloud service account
 * - GOOGLE_PRIVATE_KEY: The private key for the service account
 * - GOOGLE_SHEET_ID: The ID of your Google Sheet (from the URL)
 *
 * Google Sheet structure:
 * | id | name | description | category | price | size | type | colors | image | available | featured |
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Configuration
const SHEET_RANGE = "Inventory!A2:L"; // Adjust based on your sheet name and columns

async function main() {
  console.log("🚀 Starting Google Sheets sync...");

  // Check for required environment variables
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } =
    process.env;

  if (
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_PRIVATE_KEY ||
    !GOOGLE_SHEET_ID
  ) {
    console.log(
      "⚠️  Missing Google Sheets credentials. Using existing inventory.json",
    );
    console.log(
      "   To enable sync, add the following secrets to your GitHub repository:",
    );
    console.log("   - GOOGLE_SERVICE_ACCOUNT_EMAIL");
    console.log("   - GOOGLE_PRIVATE_KEY");
    console.log("   - GOOGLE_SHEET_ID");
    return;
  }

  try {
    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from Google Sheets
    console.log("📊 Fetching data from Google Sheets...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log("⚠️  No data found in Google Sheets");
      return;
    }

    console.log(`📝 Processing ${rows.length} rows...`);

    // Transform rows to inventory items
    const items = rows
      .map((row) => {
        const [
          id,
          name,
          description,
          category,
          price,
          size,
          type,
          colors,
          image,
          available,
          featured,
          dateAdded,
        ] = row;

        return {
          id: id?.trim() || generateId(name),
          name: name?.trim() || "",
          description: description?.trim() || "",
          category: category?.trim() || "",
          price: parseFloat(price) || null,
          size: size?.trim() || "",
          type: type?.trim() || "Original",
          colors: colors
            ? colors.split(",").map((c) => c.trim().toLowerCase())
            : [],
          image: image?.trim() || `images/artworks/${generateId(name)}.jpg`,
          available: available?.toLowerCase() !== "false" && available !== "0",
          featured: featured?.toLowerCase() === "true" || featured === "1",
          dateAdded:
            dateAdded?.trim() || new Date().toISOString().split("T")[0],
        };
      })
      .filter((item) => item.id && item.name); // Filter out empty rows

    // Create inventory object
    const inventory = {
      lastUpdated: new Date().toISOString(),
      items,
    };

    // Save to file
    const outputPath = path.join(__dirname, "..", "data", "inventory.json");
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(
      `✅ Successfully synced ${items.length} items to inventory.json`,
    );
  } catch (error) {
    console.error("❌ Error syncing from Google Sheets:", error.message);
    process.exit(1);
  }
}

function generateId(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

main();
