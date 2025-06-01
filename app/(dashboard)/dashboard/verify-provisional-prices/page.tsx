import { ProvisionalPriceList } from "@/components/products/provisional-price-list";

export default function VerifyProvisionalPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Verify Prices</h1>
      <p>
        This page allows you to verify prices that went down by at least 30% to
        check that the price matches the reality
      </p>
      <ProvisionalPriceList />
    </div>
  );
}
