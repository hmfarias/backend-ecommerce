/**
 * This file contains the routes for the cart API.
 * It defines the routes for creating, retrieving, updating, and deleting carts.
 * The routes are defined using the Express.js router.
 * The router is imported from the Express.js module.
 * The file reads the products data from a JSON file.
 */

import express from 'express';
import { readData, writeData } from '../helpers/dataHandlerFromJSON.js';

const router = express.Router();

// retrieve products data from productsData.json file
const fileProducts = './data/productsData.json';
const products = await readData(fileProducts);

// retrieve carts data from cartsData.json file
const fileCarts = './data/cartsData.json';
const carts = await readData(fileCarts);

//****************************************************************/
router.get('/', (req, res) => {
	const completeCarts = carts.map((cart) => ({
		...cart,
		products: cart.products.map((prod) => {
			const productDetails = products.find((p) => p.id === prod.idProduct) || {};
			return { ...prod, ...productDetails };
		}),
	}));

	return res.status(200).json({
		message: 'Carts retrieved successfully',
		error: false,
		payload: completeCarts,
	});
});

export default router;

//****************************************************************/
router.get('/:cid', (req, res) => {
	const cartId = parseInt(req.params.cid); // Convert number
	const cart = carts.find((cart) => cart.id === cartId); // Find the product

	if (!cart) {
		return res.status(404).json({
			message: 'Cart not found',
			error: true,
			payload: null,
		});
	}

	const completeCart = cart.products.map((prod) => {
		const productDetails = products.find((p) => p.id === prod.idProduct) || {};
		return { ...prod, ...productDetails };
	});

	return res.status(200).json({
		message: 'Cart retrieved successfully',
		error: false,
		payload: completeCart,
	});
});

//****************************************************************/
router.post('/product/:pid', (req, res) => {
	const productId = parseInt(req.params.pid);

	// Find the product
	const product = products.find((prod) => prod.id === productId);
	// If the product is not found, return an error
	if (!product) {
		return res.status(404).json({
			message: 'Product not found',
			error: true,
			payload: null,
		});
	}

	const newCart = {
		id: carts.length + 1,
		products: [{ idProduct: productId, quantity: 1 }],
	};

	// Add the new cart to the array
	carts.push(newCart);

	// Save the updated array of products to the json file
	writeData(fileCarts, carts);

	return res.status(201).json({
		message: 'cart created successfully and product added to cart',
		error: false,
		payload: newCart,
	});
});

//****************************************************************/
router.post('/:cid/product/:pid', (req, res) => {
	const cartId = parseInt(req.params.cid);
	const productId = parseInt(req.params.pid);

	// Find the product
	const product = products.find((prod) => prod.id === productId);
	// If the product is not found, return an error
	if (!product) {
		return res.status(404).json({
			message: 'Product not found',
			error: true,
			payload: null,
		});
	}
	// Find the cart
	let cart = carts.find((c) => c.id === cartId);

	// If the cart is not found, create a new one
	if (!cart) {
		const newCart = {
			id: carts.length + 1,
			products: [{ idProduct: productId, quantity: 1 }],
		};

		// Add the new cart to the array
		carts.push(newCart);

		// Save the updated array of products to the json file
		writeData(fileCarts, carts);

		return res.status(201).json({
			message: 'cart created successfully and product added to cart',
			error: false,
			payload: newCart,
		});
	}

	// If the cart exists, add the product to the cart
	// Find the product in the cart first
	const productInCart = cart.products.find((prod) => prod.idProduct === productId);

	// If the product is already in the cart, increment the quantity
	if (productInCart) {
		productInCart.quantity += 1;
	} else {
		// If the product is not in the cart, add it
		cart.products.push({ idProduct: productId, quantity: 1 });
	}

	// Save the updated array of products to the json file
	writeData(fileCarts, carts);

	return res.status(201).json({
		message: 'product successfully added to cart ',
		error: false,
		payload: cart,
	});
});
