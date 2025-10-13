import React, { useState } from 'react';
import DishModal from './dishmodal';
import './orderscreen.css';

const MenuList = ({ dishes, onAddItem, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState(null);

  // Get unique categories
  const categories = ['All', ...new Set(dishes.map(dish => dish.category))];

  // Filter dishes by selected category
  const filteredDishes = selectedCategory === 'All' 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory);

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
  };

  const handleAddItemWithDetails = (itemData) => {
    onAddItem(itemData);
    setSelectedDish(null);
  };

  if (loading) {
    return <div className="menu-loading">Loading menu...</div>;
  }

  return (
    <div className="menu-list">
      <div className="menu-header">
        <h3>Menu</h3>
        
        {/* Category Filter */}
        <div className="category-filter">
          <label>Filter: </label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="dishes-grid">
        {filteredDishes.map(dish => (
          <div key={dish.dish_id} className="menu-item">
            <div className="dish-info">
              <h4 className="dish-name">{dish.name}</h4>
              <p className="dish-description">{dish.description}</p>
              <div className="dish-meta">
                <span className="dish-category">{dish.category}</span>
                <span className="dish-price">${parseFloat(dish.sale_price).toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className="add-to-order-btn"
              onClick={() => handleDishClick(dish)}
              disabled={!dish.is_available}
            >
              {dish.is_available ? '➕ Add to Order' : '❌ Unavailable'}
            </button>
          </div>
        ))}
      </div>

      {/* Dish Modal */}
      <DishModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToOrder={handleAddItemWithDetails}
      />

      {filteredDishes.length === 0 && (
        <div className="no-dishes">
          No dishes available in {selectedCategory} category
        </div>
      )}
    </div>
  );
};

export default MenuList;