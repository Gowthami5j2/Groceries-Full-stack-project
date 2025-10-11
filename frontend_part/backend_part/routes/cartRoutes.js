const express = require('express');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes below require valid JWT

// Get cart for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get cart', error: err.message });
  }
});

// Add or update item in cart
router.post('/add', async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add item to cart', error: err.message });
  }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: err.message });
  }
});

module.exports = router;
