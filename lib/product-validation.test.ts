import { loginSchema, productSchema } from "@/lib/product-validation";

const validProduct = {
  name: "Tortillas de maíz",
  description: "Maíz nixtamalizado, recién hecho.",
  price: "24.50",
  unit: "el kilo",
  image: "https://example.com/tortillas.jpg",
  tag: "Favorito",
};

describe("productSchema", () => {
  it("normalizes valid product fields and converts its price", () => {
    const result = productSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(24.5);
      expect(result.data.name).toBe("Tortillas de maíz");
    }
  });

  it("rejects invalid prices and unsupported image URLs", () => {
    expect(productSchema.safeParse({ ...validProduct, price: "0" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, image: "javascript:alert(1)" }).success).toBe(false);
  });

  it("accepts local product images", () => {
    expect(productSchema.safeParse({ ...validProduct, image: "/products/masa.jpg" }).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("trims and lowercases the admin email", () => {
    const result = loginSchema.safeParse({ email: " Admin@Example.com ", password: "secret" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("admin@example.com");
  });
});