import connectDB from "@/DB/connectDB";
import AuthCheck from "@/middleware/AuthCheck";
import { NextResponse } from "next/server";
import Product from "@/model/Product";
import Joi from "joi";

const AddProductSchema = Joi.object({
  productName: Joi.string().required(),
  productDescription: Joi.string().required(),
  productImage: Joi.array().required(),
  productQuantity: Joi.number().required(),
  productSlug: Joi.string().required(),
  productPrice: Joi.number().required(),
  productSize: Joi.string().required(),
  productColor: Joi.string().required(),
  productCategory: Joi.required(),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();
    const isAuthenticated = await AuthCheck(req);

    if (isAuthenticated === "admin") {
      const data = await req.json();

      const {
        productCategory,
        productDescription,
        productImage,
        productName,
        productPrice,
        productSize,
        productColor,
        productQuantity,
        productSlug,
      } = data;

      const { error } = AddProductSchema.validate({
        productCategory,
        productDescription,
        productImage,
        productName,
        productPrice,
        productSize,
        productColor,
        productQuantity,
        productSlug,
      });

      if (error)
        return NextResponse.json({
          success: false,
          message: error.details[0].message.replace(/['"]+/g, ""),
        });

      const saveData = await Product.create(data);

      if (saveData) {
        return NextResponse.json({
          success: true,
          message: "Product added successfully!",
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Failed to add the Product. Please try again!",
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "You are not authorized.",
      });
    }
  } catch (error) {
    console.log("Error in adding a new Product:", error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again!",
    });
  }
}
