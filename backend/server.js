
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Vérifier le fonctionnement du backend
app.get("/", (req, res) => {
  res.send("CRUD API is running!");
});

// 1. Afficher tous les produits
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 2. Consulter un produit
app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 3. Ajouter un produit
app.post("/api/products", async (req, res) => {
  const { name, description, price, quantity } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0 ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 0
  ) {
    return res.status(400).json({ error: "Données invalides" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description || "", price, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 4. Modifier un produit
app.put("/api/products/:id", async (req, res) => {
  const { name, description, price, quantity } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0 ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 0
  ) {
    return res.status(400).json({ error: "Données invalides" });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, quantity = $4
       WHERE id = $5
       RETURNING *`,
      [name.trim(), description || "", price, quantity, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 5. Supprimer un produit
app.delete("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
