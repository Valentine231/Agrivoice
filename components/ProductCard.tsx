import Link from "next/link";
import Image from "next/image";
import { Product, CATEGORY_LABELS } from "@/lib/mockData";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/buyer/product/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-parchment-dim">
        <Image
          src={product.imageUrl}
          alt={product.cropName}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest/90 px-3 py-1 font-body text-xs font-semibold text-parchment">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-display text-lg font-semibold text-ink">{product.cropName}</h3>
        <p className="font-body text-sm text-ink/60">
          {product.quantity} · {product.state} State
        </p>
        <div className="flex items-baseline justify-between pt-2">
          <span className="font-mono text-base font-semibold text-forest">
            {formatNaira(product.pricePerUnit)}
            <span className="ml-1 font-body text-xs font-normal text-ink/50">/ {product.unit}</span>
          </span>
          <span className="font-body text-xs text-ink/50">{product.farmerName}</span>
        </div>
      </div>
    </Link>
  );
}
