
import * as Pauloxuries from "../server/server.types"

type Product = {
  id: string;
  title: string;
  price: number | string;
  image: string;
  discountPercentage: string;
  stock: number;
  sold: number;
}

export default function formatCart(cartProducts: Pauloxuries.Product[]) {
  return cartProducts.reduce<Product[]>((products, product) => {

    let cartProduct: Product = {
      id: product.id,
      title: product.title,
      price: product.price,
      stock: product.stock,
      image: JSON.parse(product.images)[0],
      discountPercentage: product.discountPercentage,
      sold: product.sold,
    };
    products.push(cartProduct);
    return products;
  }, []);
};
