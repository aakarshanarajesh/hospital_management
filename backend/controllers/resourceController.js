const Resource = require('../models/Resource');

// Add Resource
const addResource = async (req, res, next) => {
  try {
    const {
      resourceName,
      totalQuantity,
      ward,
      lowStockAlert,
    } = req.body;

    if (!resourceName || !totalQuantity || !ward) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const resource = new Resource({
      resourceName,
      totalQuantity,
      availableQuantity: totalQuantity,
      ward,
      lowStockAlert: lowStockAlert || 5,
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource added successfully',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Resources
const getAllResources = async (req, res, next) => {
  try {
    const { ward } = req.query;
    const filter = {};
    if (ward) filter.ward = ward;

    const resources = await Resource.find(filter);
    res.json(resources);
  } catch (error) {
    next(error);
  }
};

// Get Resource by ID
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// Update Resource Quantity
const updateResourceQuantity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantityUsed } = req.body;

    if (quantityUsed === undefined) {
      return res
        .status(400)
        .json({ message: 'Quantity used is required' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const newAvailable = resource.availableQuantity - quantityUsed;

    if (newAvailable < 0) {
      return res.status(400).json({
        message: 'Not enough resources available',
      });
    }

    resource.availableQuantity = newAvailable;
    resource.usedQuantity += quantityUsed;
    resource.isLowStock = newAvailable <= resource.lowStockAlert;
    resource.lastUpdated = new Date();

    await resource.save();

    // Check if low stock alert needed
    const alert =
      resource.isLowStock &&
      quantityUsed > 0
        ? `⚠️ WARNING: ${resource.resourceName} in ${resource.ward} is running low (${newAvailable}/${resource.totalQuantity})`
        : null;

    res.json({
      message: 'Resource quantity updated successfully',
      resource,
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// Restock Resource
const restockResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantityAdded } = req.body;

    if (!quantityAdded) {
      return res
        .status(400)
        .json({ message: 'Quantity added is required' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.availableQuantity += quantityAdded;
    resource.isLowStock = resource.availableQuantity <= resource.lowStockAlert;
    resource.lastUpdated = new Date();

    await resource.save();

    res.json({
      message: 'Resource restocked successfully',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// Get Low Stock Resources
const getLowStockResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ isLowStock: true });

    res.json({
      message: 'Low stock resources',
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// Get Resource Statistics
const getResourceStatistics = async (req, res, next) => {
  try {
    const resources = await Resource.find();

    const stats = resources.map(r => ({
      resourceName: r.resourceName,
      ward: r.ward,
      total: r.totalQuantity,
      available: r.availableQuantity,
      used: r.usedQuantity,
      utilizationPercentage: Math.round(
        ((r.usedQuantity / r.totalQuantity) * 100)
      ),
      isLowStock: r.isLowStock,
    }));

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addResource,
  getAllResources,
  getResourceById,
  updateResourceQuantity,
  restockResource,
  getLowStockResources,
  getResourceStatistics,
};
