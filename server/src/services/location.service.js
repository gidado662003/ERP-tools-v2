const Location = require("../models/location.schema");

const CATEGORY_BY_LOCATION_TYPE = {
  STORE: "other",
  CUSTOMER_SITE: "cpe",
  NOC: "noc",
  POP: "pop",
  VENDOR_SITE: "other",
};

const LOCATION_TYPE_ALIASES = {
  WAREHOUSE: "STORE",
  OTHER: "STORE",
};

function normalizeLocationType(rawType) {
  const normalized = String(rawType || "")
    .trim()
    .toUpperCase();
  return LOCATION_TYPE_ALIASES[normalized] || normalized;
}

async function getLocations(search) {
  const query = { isActive: true };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  return Location.find(query).sort({ name: 1 }).lean();
}

async function getLocationByName(name) {
  if (!name) return null;
  return Location.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    isActive: true,
  }).lean();
}

async function createLocation(payload) {
  if (!payload?.type) {
    throw new Error("type is required");
  }

  const normalizedType = normalizeLocationType(payload.type);
  const derivedCategory = CATEGORY_BY_LOCATION_TYPE[normalizedType];
  if (!derivedCategory) {
    throw new Error("Invalid location type");
  }

  const location = new Location({
    ...payload,
    type: normalizedType,
    defaultCategory: derivedCategory,
  });
  await location.save();
  return location;
}

module.exports = {
  getLocations,
  getLocationByName,
  createLocation,
};
