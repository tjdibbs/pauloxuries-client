import { Product } from "@lib/types";

export default function sortByPrice(
  a: Product,
  b: Product,
  order: "P-L-H" | "P-H-L"
) {
  let priceA = a.price as number,
    priceB = b.price as number;

  let discountA = a.discountPercentage
    ? (a.discountPercentage / 100) * priceA
    : 1;
  let discountB = b.discountPercentage
    ? (b.discountPercentage / 100) * priceB
    : 1;

  (priceA = priceA - discountA), (priceB = priceB - discountB);

  return order === "P-L-H" ? priceA - priceB : priceB - priceA;
}
