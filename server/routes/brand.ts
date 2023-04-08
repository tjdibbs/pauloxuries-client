import client from "@lib/connection/db";
import type { Request, Response } from "express";

export default async function Brand(req: Request, res: Response) {
  try {
    let { limit, skip } = req.query;

    const brandsQuery = `SELECT COUNT(id), brand, images FROM Product GROUP BY brand, images ORDER BY createdAt DESC LIMIT ${
      limit ? (skip ? skip + "," + limit + skip : limit) : 12
    }`;

    const brands = (await client.query(brandsQuery))[0] as {
      images: string;
      brand: string;
    }[];

    let brandNames: string[] = [];

    let filteredBrands: { brand: {}; image: string }[] = [];

    brands.forEach(({ images, brand }, index: number) => {
      if (brandNames.includes(brand.toLowerCase().trim()) || brand == "unknown")
        return false;
      brandNames.push(brand.toLowerCase().trim());
      filteredBrands.push({ brand, image: JSON.parse(images)[0] });
    });

    return res.json({ success: true, brands: filteredBrands });
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
}
