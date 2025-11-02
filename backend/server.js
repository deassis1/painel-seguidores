// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";
import { google } from "googleapis";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- GOOGLE SHEETS CONFIG ---
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// --- ROTAS ---
app.post("/api/pedidos", async (req, res) => {
  try {
    const { username, quantidade, valor } = req.body;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Pedidos!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[username, quantidade, valor, new Date().toLocaleString()]],
      },
    });

    res.json({ success: true, message: "Pedido registrado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar pedido" });
  }
});

// --- CHECKOUT STRIPE ---
app.post("/api/checkout", async (req, res) => {
  try {
    const { amount, description } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: description },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no checkout" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
      
