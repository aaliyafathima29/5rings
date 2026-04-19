const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  addReview
} = require('../controller/productController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAuth');

// Public routes
router.get('/', getAllProducts);

// Protected routes - Vendor only (specific routes first)
router.get('/my-products', verifyToken, checkRole('vendor'), getVendorProducts);
router.post('/', verifyToken, checkRole('vendor'), createProduct);
router.put('/:id', verifyToken, checkRole('vendor'), updateProduct);
router.delete('/:id', verifyToken, checkRole('vendor'), deleteProduct);

// Public routes with params (after specific routes)
router.get('/:id', getProduct);

// Protected routes - User only
router.post('/:id/review', verifyToken, checkRole('user'), addReview);

module.exports = router;
