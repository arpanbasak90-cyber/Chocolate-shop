import { db } from '../services/database.js';

export async function getAllProducts(req, res) {
  try {
    const { category, search, sortBy } = req.query;
    const products = await db.getProducts({ category, search, sortBy });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

export async function getProduct(req, res) {
  try {
    const { idOrSlug } = req.params;
    const product = await db.getProductByIdOrSlug(idOrSlug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Chocolate variety not found.' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error in getProduct:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

export async function adminCreateProduct(req, res) {
  try {
    const { name, piecePrice, boxPrice, category, shortDescription, fullDescription, approxPiecesPer250g, badge, tag, image } = req.body;

    if (!name || piecePrice === undefined || boxPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Product Name, Per-Piece Price, and 250g Box Price are required.' });
    }

    const created = await db.createProduct({
      name,
      piecePrice: Number(piecePrice),
      boxPrice: Number(boxPrice),
      category: category || 'Classics',
      shortDescription: shortDescription || `${name} handcrafted with pure cocoa.`,
      fullDescription: fullDescription || shortDescription,
      approxPiecesPer250g: approxPiecesPer250g || '20-24 pcs',
      badge: badge || 'Fresh Batch',
      tag: tag || 'Handmade',
      image: image || '/chocolate-placeholder.svg',
      isAvailable: true
    });

    return res.status(201).json({ success: true, message: 'New chocolate variety added to catalog!', product: created });
  } catch (error) {
    console.error('Error in adminCreateProduct:', error);
    return res.status(500).json({ success: false, message: 'Failed to add product.' });
  }
}

export async function adminUpdateProduct(req, res) {
  try {
    const { id } = req.params;
    const updated = await db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (error) {
    console.error('Error in adminUpdateProduct:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

export async function adminToggleStock(req, res) {
  try {
    const { id } = req.params;
    const existing = await db.getProductByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const updated = await db.updateProduct(id, { isAvailable: !existing.isAvailable });
    return res.status(200).json({
      success: true,
      message: `Product marked as ${updated.isAvailable ? 'In Stock' : 'Out of Stock'}.`,
      isAvailable: updated.isAvailable
    });
  } catch (error) {
    console.error('Error in adminToggleStock:', error);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
}

export async function adminDeleteProduct(req, res) {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    return res.status(200).json({ success: true, message: 'Product removed from store catalog.' });
  } catch (error) {
    console.error('Error in adminDeleteProduct:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}

