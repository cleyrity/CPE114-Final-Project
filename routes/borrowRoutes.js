const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

router.get('/', borrowController.getAllBorrowRecords);
router.get('/overdue', borrowController.getOverdueBooks);
router.post('/', borrowController.borrowBook);
router.put('/:borrowId/return', borrowController.returnBook);
router.get('/member/:memberId', borrowController.getMemberBorrows);

module.exports = router;