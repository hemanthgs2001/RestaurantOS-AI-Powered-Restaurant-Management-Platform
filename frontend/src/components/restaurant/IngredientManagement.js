import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantity: 0,
    reorderLevel: 10,
    unitPrice: 0
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await getIngredients();
      setIngredients(response.data);
    } catch (error) {
      toast.error('Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, formData);
        toast.success('Ingredient updated successfully');
      } else {
        await createIngredient(formData);
        toast.success('Ingredient created successfully');
      }
      setShowModal(false);
      setEditingIngredient(null);
      setFormData({ name: '', unit: '', quantity: 0, reorderLevel: 10, unitPrice: 0 });
      fetchIngredients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await deleteIngredient(id);
        toast.success('Ingredient deleted successfully');
        fetchIngredients();
      } catch (error) {
        toast.error('Failed to delete ingredient');
      }
    }
  };

  const isLowStock = (quantity, reorderLevel) => {
    return quantity <= reorderLevel;
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Ingredient Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Ingredient
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td><strong>{ingredient.name}</strong></td>
                <td>{ingredient.unit}</td>
                <td>{ingredient.quantity}</td>
                <td>{ingredient.reorderLevel}</td>
                <td>${ingredient.unitPrice?.toFixed(2)}</td>
                <td>
                  <span className={`badge ${isLowStock(ingredient.quantity, ingredient.reorderLevel) ? 'badge-danger' : 'badge-success'}`}>
                    {isLowStock(ingredient.quantity, ingredient.reorderLevel) ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingIngredient(ingredient);
                      setFormData(ingredient);
                      setShowModal(true);
                    }}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(ingredient.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>{editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Unit</label>
                <input
                  type="text"
                  className="input"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, g, L, ml, pieces"
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Reorder Level</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingIngredient ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIngredient(null);
                    setFormData({ name: '', unit: '', quantity: 0, reorderLevel: 10, unitPrice: 0 });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientManagement;