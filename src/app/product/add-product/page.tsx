"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { storage } from "@/utils/Firebase";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { ToastContainer, toast } from "react-toastify";
import path from "path";
import { TailSpin } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/Store/store";
import Cookies from "js-cookie";
import { useSWRConfig } from "swr";
import { add_new_product } from "@/Services/Admin/product";

type Inputs = {
  name: string;
  description: string;
  slug: string;
  price: Number;
  color: String;
  size: String;
  quantity: Number;
  categoryID: string;
  image: Array<File>;
};

interface loaderType {
  loader: Boolean;
}

interface Image {
  name: string;
  data: Blob;
}

// const uploadImages = async (productName: String, file: File) => {
//   const createFileName = () => {
//     const timestamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 8);
//     const fileName = path.parse(file?.name).name;
//     return `${fileName}-${timestamp}-${randomString}`;
//   };

//   const fileName = createFileName();
//   const storageRef = ref(
//     storage,
//     `${productName.replace(/\s+/g, "-").toLowerCase()}/${fileName}`
//   );
//   const uploadTask = uploadBytesResumable(storageRef, file);

//   return new Promise((resolve, reject) => {
//     uploadTask.on(
//       "state_changed",
//       (snapshot) => {},
//       (error) => {
//         console.log(error);
//         reject(error);
//       },
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref)
//           .then((downloadURL) => {
//             resolve(downloadURL);
//           })
//           .catch((error) => {
//             console.log(error);
//             reject(error);
//           });
//       }
//     );
//   });
// };

const uploadImagesToFB = async (
  productName: string,
  images: Image[]
): Promise<string[]> => {
  // Get a reference to the storage service
  // const storage = getStorage();

  // Array to store the URLs of the uploaded images
  const urls: string[] = [];
  console.log("images", images);
  // Loop through the images and upload them to Firebase Storage
  for (const image of images) {
    const fileName = path.parse(image.name).name;
    // Create a reference to the file
    const fileRef = ref(
      storage,
      `${productName.replace(/\s+/g, "-").toLowerCase()}/${image.name}`
    );

    // Upload the file
    const uploadTask = uploadBytesResumable(fileRef, image);

    // Wait for the upload to complete
    // await new Promise<void>((resolve, reject) => {
    //   uploadTask.on(
    //     "state_changed",
    //     (snapshot) => {
    //       // Observe state change events such as progress, pause, and resume
    //       const progress =
    //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //       console.log("Upload is " + progress + "% done");
    //     },
    //     (error) => {
    //       // Handle unsuccessful uploads
    //       console.error("Error uploading file:", error);
    //       reject(error);
    //     },
    //     () => {
    //       // Handle successful uploads on complete
    //       console.log("Upload complete");
    //       resolve();
    //     }
    //   );
    // });

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.log(error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              // const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File available at", downloadURL);

              // Add the URL to the array
              urls.push(downloadURL);
              resolve(downloadURL);
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        }
      );
    });

    // Get the download URL
  }

  // Return the array of URLs
  return urls;
};

const maxSize = (value: File) => {
  const fileSize = value.size / 1024 / 1024;
  return fileSize < 1 ? false : true;
};

type CategoryData = {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryImage: string;
  categorySlug: string;
  createdAt: string;
  updatedAt: string;
};

interface userData {
  email: String;
  role: String;
  _id: String;
  name: String;
}

export default function AddProduct() {
  const [loader, setLoader] = useState(false);
  const Router = useRouter();
  const category = useSelector((state: RootState) => state.Admin.category) as
    | CategoryData[]
    | undefined;

  console.log("category", category);

  useEffect(() => {
    const user: userData | null = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
    if (!Cookies.get("token") || user?.role !== "admin") {
      Router.push("/");
    }
  }, [Router]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<Inputs>({
    criteriaMode: "all",
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("onSubmit", data);
    setLoader(true);

    const uploadImageToFirebase = await uploadImagesToFB(data.name, data.image);
    // const uploadImageToFirebase = 'https://firebasestorage.googleapis.com/v0/b/socialapp-9b83f.appspot.com/o/ecommerce%2Fcategory%2Fimages131.jpg-1683339363348-c4vcab?alt=media&token=f9303ff9-7d34-4514-a53f-832f72814337';

    const finalData = {
      productName: data.name,
      productCategory: data.categoryID,
      productDescription: data.description,
      productPrice: data.price,
      productColor: data.color,
      productSize: data.size,
      productImage: uploadImageToFirebase,
      productSlug: data.slug,
      productQuantity: data.quantity,
    };
    const res = await add_new_product(finalData);
    if (res.success) {
      toast.success(res?.message);
      setTimeout(() => {
        Router.push("/dashboard");
      }, 2000);
      setLoader(false);
    } else {
      toast.error(res?.message);
      setLoader(false);
    }
  };

  return (
    <div className="w-full  p-4 min-h-screen  bg-gray-50 flex flex-col ">
      <div className="text-sm breadcrumbs  border-b-2 border-b-orange-600">
        <ul className="dark:text-black">
          <li>
            <Link href={"/dashboard"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-4 h-4 mr-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                ></path>
              </svg>
              Home
            </Link>
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-4 h-4 mr-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Add Product
          </li>
        </ul>
      </div>
      <div className="w-full h-20 my-2 text-center">
        <h1 className="text-2xl py-2 dark:text-black ">Add Product</h1>
      </div>
      {loader ? (
        <div className="w-full  flex-col h-96 flex items-center justify-center ">
          <TailSpin
            height="50"
            width="50"
            color="orange"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
          <p className="text-sm mt-2 font-semibold text-orange-500">
            Adding Product Hold Tight ....
          </p>
        </div>
      ) : (
        <div className="w-full h-full flex items-start justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-lg  py-2 flex-col "
          >
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Name</span>
              </label>
              <input
                {...register("name", { required: true })}
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control w-full max-w-full">
              <label className="label">
                <span className="label-text">Choose Category</span>
              </label>
              <select
                {...register("categoryID", { required: true })}
                className="select select-bordered"
              >
                <option disabled selected>
                  Pick one category{" "}
                </option>
                {category?.map((item) => {
                  return (
                    <option key={item._id} value={item._id}>
                      {item.categoryName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Slug</span>
              </label>
              <input
                {...register("slug", { required: true })}
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.slug && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>

            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Price</span>
              </label>
              <input
                {...register("price", { required: true })}
                type="number"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.slug && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Color</span>
              </label>
              <input
                {...register("color", { required: true })}
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.color && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Size</span>
              </label>
              <input
                {...register("size", { required: true })}
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.size && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Product Quantity</span>
              </label>
              <input
                {...register("quantity", { required: true })}
                type="number"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
              {errors.slug && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Product Description</span>
              </label>
              <textarea
                {...register("description", { required: true })}
                className="textarea textarea-bordered h-24"
                placeholder="Description"
              ></textarea>
              {errors.description && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required
                </span>
              )}
            </div>
            <div className="form-control w-full ">
              <label className="label">
                <span className="label-text">Add product Image</span>
              </label>
              <input
                accept="image/*"
                max="1000000"
                {...register("image", { required: true })}
                type="file"
                multiple
                className="file-input file-input-bordered w-full "
              />
              {errors.image && (
                <span className="text-red-500 text-xs mt-2">
                  This field is required and the image must be less than or
                  equal to 1MB.
                </span>
              )}
            </div>

            <button className="btn btn-block mt-3">Done !</button>
          </form>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
