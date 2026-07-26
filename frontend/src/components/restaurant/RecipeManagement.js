import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    yieldQuantity: 0
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipes();
      setRecipes(response.data);
    } catch (error) {
      toast.error('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, formData);
        toast.success('Recipe updated successfully');
      } else {
        await createRecipe(formData);
        toast.success('Recipe created successfully');
      }
      setShowModal(false);
      setEditingRecipe(null);
      setFormData({ name: '', description: '', instructions: '', prepTime: 0, cookTime: 0, servings: 0, yieldQuantity: 0 });
      fetchRecipes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        toast.success('Recipe deleted successfully');
        fetchRecipes();
      } catch (error) {
        toast.error('Failed to delete recipe');
      }
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Recipe Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Recipe
        </button>
      </div>

      <div className="grid-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{recipe.name}</h3>
              <div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setEditingRecipe(recipe);
                    setFormData(recipe);
                    setShowModal(true);
                  }}
                  style={{ marginRight: '0.5rem' }}
                >
                  <FiEdit2 />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(recipe.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            {recipe.description && <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>{recipe.description}</p>}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6B7280' }}>
              <span>Prep: {recipe.prepTime || 0} min</span>
              <span>Cook: {recipe.cookTime || 0} min</span>
              <span>Servings: {recipe.servings || 0}</span>
            </div>
            <button
              className="btn btn-sm btn-primary"
              style={{ marginTop: '0.5rem' }}
              onClick={() => setSelectedRecipe(recipe)}
            >
              <FiBook /> View Details
            </button>
          </div>
        ))}
      </div>

      {/* Recipe Details Modal */}
      {selectedRecipe && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{selectedRecipe.name}</h2>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Description:</strong> {selectedRecipe.description || 'No description'}</p>
              <p><strong>Prep Time:</strong> {selectedRecipe.prepTime || 0} minutes</p>
              <p><strong>Servings:</strong> {selectedRecipe.servings || 0}</p>
              <p><strong>Yield Quantity:</strong> {selectedRecipe.yieldQuantity || 0}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Instructions:</strong>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                  {selectedRecipe.instructions || 'No instructions provided'}
                </p>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedRecipe(null)}
              style={{ marginTop: '1.5rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
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
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{editingRecipe ? 'Edit Recipe' : 'Add Recipe'}</h2>
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
                <label>Description</label>
                <textarea
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Instructions</label>
                <textarea
                  className="input"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows="4"
                  placeholder="Step by step instructions..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Prep Time (min)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label>Servings</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label>Yield Quantity</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.yieldQuantity}
                    onChange={(e) => setFormData({ ...formData, yieldQuantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingRecipe ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecipe(null);
                    setFormData({ name: '', description: '', instructions: '', prepTime: 0, cookTime: 0, servings: 0, yieldQuantity: 0 });
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

export default RecipeManagement;