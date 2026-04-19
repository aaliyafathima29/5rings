const express = require('express');
const router = express.Router();
const foodController = require('../controller/foodController');
const { verifyToken: auth } = require('../middleware/auth');
const { checkRole, checkApprovalStatus } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/menu', foodController.getAllMenuItems);

// ── Vendor: Menu Management ──────────────────────────────────────────────────
router.post('/menu',        auth, checkRole('vendor'), checkApprovalStatus, upload.single('image'), foodController.createMenuItem);
router.get('/vendor/menu',  auth, checkRole('vendor'), foodController.getVendorMenu);
router.put('/menu/:id',     auth, checkRole('vendor', 'admin'), upload.single('image'), foodController.updateMenuItem);
router.delete('/menu/:id',  auth, checkRole('vendor', 'admin'), foodController.deleteMenuItem);

// ── Vendor: Sales Overview ───────────────────────────────────────────────────
router.get('/vendor/orders',       auth, checkRole('vendor', 'admin'), foodController.getVendorOrders);
router.get('/vendor/sales-stats',  auth, checkRole('vendor', 'admin'), foodController.getVendorSalesStats);

// ── Kitchen: Order Management ────────────────────────────────────────────────
router.get('/kitchen/orders',       auth, checkRole('kitchen', 'admin'), foodController.getKitchenOrders);
router.put('/kitchen/orders/:id/status', auth, checkRole('kitchen', 'admin'), foodController.updateOrderStatus);

// ── Delivery: Order Management ───────────────────────────────────────────────
router.get('/delivery/orders', auth, checkRole('delivery'), foodController.getDeliveryOrders);
router.put('/delivery/orders/:id/accept', auth, checkRole('delivery'), foodController.acceptDeliveryOrder);
router.put('/delivery/orders/:id/location', auth, checkRole('delivery'), foodController.updateDeliveryLocation);
router.put('/delivery/orders/:id/complete', auth, checkRole('delivery'), foodController.completeDelivery);

// ── User: Place & View Orders ────────────────────────────────────────────────
router.post('/orders',          auth, foodController.createOrder);
router.get('/orders',           auth, foodController.getUserOrders);
router.put('/orders/:id/cancel', auth, foodController.cancelOrder);
router.post('/orders/:id/chat', auth, foodController.postDeliveryChatMessage);
router.post('/orders/:id/rate', auth, foodController.rateOrder);

module.exports = router;
