import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// favicon.ico ignorieren
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Neue Route: /add/:title
// Beispiel: /add/Apfel?person=<PageID>&preis=5
app.get("/add/:title", async (req, res) => {
  const title = req.params.title || "Unbenannt";
  const personPageId = req.query.person; // ID aus Personen-Datenbank
  const preis = req.query.preis ? Number(req.query.preis) : 1; // Default 1
  const today = new Date().toISOString();

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [
              {
                text: { content: title }
              }
            ]
          },
          Personen: personPageId
            ? {
                relation: [
                  {
                    id: personPageId
                  }
                ]
              }
            : undefined,
          Datum: {
            date: {
              start: today
            }
          },
          Preis: {
            number: preis
          }
        }
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create page in Notion" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
