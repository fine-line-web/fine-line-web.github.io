/**
 * Google Sheets Sync Script
 * Fetches inventory data from Google Sheets and saves it as JSON
 *
 * Required GitHub Actions secrets:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Service account private key
 * - GOOGLE_SHEET_ID: Google Sheet ID (from the URL)
 *
 * Google Sheet structure:
 * | id | name | description | category | price | size | type | colors | images | available | featured | dateAdded | variants |
 *
 * Notes:
 * - images: comma-separated list of image filenames (e.g. "kar001,kar001-2,kar001-3")
 * - variants: comma-separated list of variants (e.g. "Labrador,Golden Retriever,Schäfer")
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Configuration
const SHEET_RANGE = "Inventory!A2:M"; // Adjust based on your sheet name and columns

async function main() {
  console.log("🚀 Starting Google Sheets sync...");

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
      "\n   To enable sync, add these secrets to your GitHub repository:",
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
          images,
          available,
          featured,
          dateAdded,
          variants,
        ] = row;

        // Parse images as array (comma-separated)
        const imageList = images
          ? images
              .split(",")
              .map((img) => img.trim())
              .filter(Boolean)
          : [];

        // Parse variants as array (comma-separated)
        const variantList = variants
          ? variants
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          : [];

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
          images: imageList.length > 0 ? imageList : [generateId(name)],
          image: imageList.length > 0 ? imageList[0] : generateId(name), // Keep for backwards compatibility
          variants: variantList,
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
