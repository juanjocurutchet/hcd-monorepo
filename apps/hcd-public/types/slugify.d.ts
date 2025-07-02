declare module "slugify" {
  export default function slugify(
    input: string,
    options?: { lower?: boolean; strict?: boolean; locale?: string }
  ): string
}