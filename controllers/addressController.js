import addressModel from "../models/addressModel.js";

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.body;

    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { userId, firstName, lastName, email, street, city, state, zipcode, country, phone, isDefault } = req.body;

    // If this address is set as default, remove default from other addresses
    if (isDefault) {
      await addressModel.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new addressModel({
      userId,
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
      isDefault: isDefault || false
    });

    await newAddress.save();

    res.json({ success: true, message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId, userId, firstName, lastName, email, street, city, state, zipcode, country, phone, isDefault } = req.body;

    // If this address is set as default, remove default from other addresses
    if (isDefault) {
      await addressModel.updateMany({ userId }, { isDefault: false });
    }

    const updatedAddress = await addressModel.findByIdAndUpdate(
      addressId,
      { firstName, lastName, email, street, city, state, zipcode, country, phone, isDefault },
      { new: true }
    );

    if (!updatedAddress) {
      return res.json({ success: false, message: "Address not found" });
    }

    res.json({ success: true, message: "Address updated successfully", address: updatedAddress });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.body;

    await addressModel.findByIdAndDelete(addressId);

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId, userId } = req.body;

    // Remove default from all addresses
    await addressModel.updateMany({ userId }, { isDefault: false });

    // Set new default
    await addressModel.findByIdAndUpdate(addressId, { isDefault: true });

    res.json({ success: true, message: "Default address updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };