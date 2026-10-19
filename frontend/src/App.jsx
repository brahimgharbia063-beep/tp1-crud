
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3001/api/products";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  quantity: 0,
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error();
      setProducts(await response.json());
      setError("");
    } catch {
      setError("Impossible de contacter le serveur.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            quantity: Number(form.quantity),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur");

      setForm(emptyForm);
      setEditingId(null);
      setSelected(null);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function viewProduct(id) {
    try {
      const response = await fetch(`${API}/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSelected(data);
    } catch (err) {
      setError(err.message || "Impossible de consulter le produit.");
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity,
    });
    setSelected(null);
  }

  async function deleteProduct(id) {
    if (!window.confirm("Voulez-vous supprimer ce produit ?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (selected?.id === id) setSelected(null);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadProducts();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <main className="container">
      <h1>Gestion des produits</h1>
      <p className="subtitle">TP1 — Application CRUD Full Stack</p>

      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>{editingId ? "Modifier le produit" : "Ajouter un produit"}</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Nom
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="form-row">
            <label>
              Prix
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Quantité
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="actions">
            <button type="submit">
              {editingId ? "Enregistrer les modifications" : "Ajouter"}
            </button>

            {editingId && (
              <button type="button" className="secondary" onClick={cancelEdit}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      {selected && (
        <section className="panel">
          <h2>Détails du produit</h2>
          <p><strong>ID :</strong> {selected.id}</p>
          <p><strong>Nom :</strong> {selected.name}</p>
          <p><strong>Description :</strong> {selected.description || "—"}</p>
          <p><strong>Prix :</strong> {selected.price} DT</p>
          <p><strong>Quantité :</strong> {selected.quantity}</p>
          <button className="secondary" onClick={() => setSelected(null)}>
            Fermer
          </button>
        </section>
      )}

      <section className="panel">
        <h2>Liste des produits ({products.length})</h2>

        {products.length === 0 ? (
          <p>Aucun produit enregistré.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prix</th>
                  <th>Quantité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.price} DT</td>
                    <td>{product.quantity}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => viewProduct(product.id)}>
                          Voir
                        </button>
                        <button
                          className="secondary"
                          onClick={() => editProduct(product)}
                        >
                          Modifier
                        </button>
                        <button
                          className="danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
