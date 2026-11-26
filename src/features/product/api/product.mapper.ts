import { toTitleCase } from '../../../lib/format'
import {
  optionKey,
  type Money,
  type Product,
  type ProductImage,
  type Variation,
  type VariationKind,
} from '../model/product'
import type { ProductDto, VariantDto, VariationDto } from './product.dto'

const BRAND = 'Achilles'

/** EasyOrders uses `0` for "not set": no sale price, or "inherit from product". */
export function resolveMoney(price: number, salePrice: number): Money {
  const hasDiscount = salePrice > 0 && salePrice < price
  return hasDiscount ? { current: salePrice, compareAt: price } : { current: price, compareAt: null }
}

function toVariationKind(type: VariationDto['type']): VariationKind {
  if (type === 'image' || type === 'color') return type
  return 'text'
}

function mapVariation(dto: VariationDto): Variation {
  return {
    id: dto.id,
    name: dto.name,
    label: toTitleCase(dto.name),
    kind: toVariationKind(dto.type),
    options: dto.props.map((prop) => ({
      id: prop.id,
      value: prop.name,
      label: toTitleCase(prop.name),
      swatch: prop.value || undefined,
    })),
  }
}

/**
 * Variant pricing, where 0 means "not set":
 *  - variant has no own price, or the same price as the product → it inherits the
 *    product's sale too (otherwise the 190 → 160 discount would vanish the moment a
 *    size is picked, because every variant ships `sale_price: 0`);
 *  - variant has its *own* price → only its own sale price applies. Applying the
 *    product's sale to a different base price would invent a fake discount.
 */
function mapVariantPrice(variant: VariantDto, product: ProductDto): Money {
  const inheritsPrice = variant.price <= 0 || variant.price === product.price
  if (inheritsPrice) {
    return resolveMoney(product.price, variant.sale_price > 0 ? variant.sale_price : product.sale_price)
  }
  return resolveMoney(variant.price, variant.sale_price)
}

function collectImages(dto: ProductDto, variations: Variation[]): ProductImage[] {
  const seen = new Set<string>()
  const images: ProductImage[] = []
  const push = (image: ProductImage) => {
    if (!image.src || seen.has(image.src)) return
    seen.add(image.src)
    images.push(image)
  }

  dto.images.forEach((src, index) => push({ src, alt: `${dto.name} — view ${index + 1}` }))
  push({ src: dto.thumb, alt: dto.name })
  variations
    .filter((variation) => variation.kind === 'image')
    .forEach((variation) =>
      variation.options.forEach((option) =>
        push({
          src: option.swatch ?? '',
          alt: `${dto.name} — ${option.label}`,
          optionKey: optionKey(variation.name, option.value),
        }),
      ),
    )
  return images
}

/** Deterministic placeholder until the API exposes real sales data. */
function placeholderSoldCount(id: string) {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return 800 + (seed % 900)
}

export function mapProduct(dto: ProductDto): Product {
  const variations = dto.variations.map(mapVariation)

  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    brand: BRAND,
    descriptionHtml: dto.description,
    price: resolveMoney(dto.price, dto.sale_price),
    images: collectImages(dto, variations),
    variations,
    variants: dto.variants.map((variant) => ({
      id: variant.id,
      price: mapVariantPrice(variant, dto),
      stock: variant.quantity,
      options: Object.fromEntries(
        variant.variation_props.map((prop) => [prop.variation, prop.variation_prop]),
      ),
    })),
    categories: dto.categories.map((category) => ({
      id: category.id,
      name: toTitleCase(category.name),
      slug: category.slug,
      image: category.thumb,
    })),
    inventory: {
      tracked: dto.track_stock && dto.disable_orders_for_no_stock,
      stock: dto.quantity,
    },
    stickyBuyBar: dto.is_fixed_bottom_buy,
    soldCount: placeholderSoldCount(dto.id),
  }
}
