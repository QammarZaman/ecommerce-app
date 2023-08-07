import mongoose from "mongoose";
import Category from "./Category";

const ProductSchema = new mongoose.Schema(
  {
    productName: String,
    productDescription: String,
    productImage: Array,
    productSlug: String,
    productPrice: Number,
    productQuantity: Number,
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    productSize: String,
    productColor: String,
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Products || mongoose.model("Products", ProductSchema);

export default Product;
