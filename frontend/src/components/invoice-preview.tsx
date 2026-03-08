interface PreviewItem {
  description: string;
  rate?: number | null;
  quantity?: number | null;
  amount: number;
  is_subitem: boolean;
}

interface PreviewClient {
  name: string;
  company?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

interface PreviewSettings {
  owner_name: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  email?: string;
  phone?: string;
  website?: string;
  etransfer_email?: string;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  date: string;
  client: PreviewClient | null;
  items: PreviewItem[];
  taxRate: number;
  subtotal: number;
  total: number;
  paymentTerms?: string | null;
  settings: PreviewSettings | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function InvoicePreview({
  invoiceNumber,
  date,
  client,
  items,
  taxRate,
  subtotal,
  total,
  paymentTerms,
  settings,
}: InvoicePreviewProps) {
  const deposit = total / 2;

  return (
    <div
      className="w-full max-w-[595px] mx-auto rounded shadow-sm text-[9px] leading-[1.5]"
      style={{
        backgroundColor: "#F5F5E8",
        fontFamily: "Helvetica, Arial, sans-serif",
        aspectRatio: "210 / 297",
        padding: "25px 25px 20px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <p className="text-[36px] font-bold leading-none tracking-tight">Invoice</p>
        <div className="text-right pt-1">
          <p>{date ? formatDate(date) : ""}</p>
          <p className="font-bold">Invoice No. {invoiceNumber}</p>
        </div>
      </div>

      {/* Top divider */}
      <div className="border-t mt-4 mb-3" style={{ borderColor: "#CCCCBB" }} />

      {/* Billed to */}
      <div className="mb-4">
        <p className="font-bold mb-1">Billed to:</p>
        {client ? (
          <div className="leading-[1.6]">
            <p>{client.name}</p>
            {client.company && <p>{client.company}</p>}
            {client.address && <p>{client.address}</p>}
            {client.city && (
              <p>
                {client.city}, {client.province}, {client.postal_code}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic">No client selected</p>
        )}
      </div>

      {/* Line items table */}
      <div className="flex-1">
        {/* Table header */}
        <div className="flex font-bold pb-1 border-b" style={{ borderColor: "#CCCCBB" }}>
          <span className="flex-1">Description</span>
          <span className="w-[60px] text-right">Rate</span>
          <span className="w-[40px] text-right">Qty</span>
          <span className="w-[60px] text-right">Amount</span>
        </div>

        {/* Rows */}
        {items
          .filter((i) => i.description)
          .map((item, idx) => (
            <div
              key={idx}
              className="flex py-[6px] border-b"
              style={{ borderColor: "#DDDDCC" }}
            >
              <span className={`flex-1 ${item.is_subitem ? "pl-3 text-gray-600" : ""}`}>
                {item.description}
              </span>
              {!item.is_subitem ? (
                <>
                  <span className="w-[60px] text-right">
                    {item.rate ? fmt(item.rate) : ""}
                  </span>
                  <span className="w-[40px] text-right">
                    {item.quantity
                      ? item.quantity === Math.floor(item.quantity)
                        ? item.quantity
                        : item.quantity
                      : ""}
                  </span>
                  <span className="w-[60px] text-right">{fmt(item.amount)}</span>
                </>
              ) : (
                <>
                  <span className="w-[60px]" />
                  <span className="w-[40px]" />
                  <span className="w-[60px]" />
                </>
              )}
            </div>
          ))}

        {/* Totals */}
        <div className="mt-4 text-right">
          {taxRate > 0 && (
            <>
              <div className="flex justify-end gap-4 mb-1">
                <span>Subtotal</span>
                <span className="w-[60px]">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-end gap-4 mb-1">
                <span>Tax ({taxRate}%)</span>
                <span className="w-[60px]">{fmt(subtotal * (taxRate / 100))}</span>
              </div>
            </>
          )}
          <div className="flex justify-end gap-4 mb-1">
            <span>Deposit Due (50%)</span>
            <span className="w-[60px]">{fmt(deposit)}</span>
          </div>
          <div className="flex justify-end gap-4 mb-1">
            <span>Balance on Delivery (50%)</span>
            <span className="w-[60px]">{fmt(deposit)}</span>
          </div>
          <div
            className="border-t mt-2 pt-2 flex justify-end gap-4 font-bold"
            style={{ borderColor: "#CCCCBB" }}
          >
            <span>Total</span>
            <span className="w-[60px]">{fmt(total)}</span>
          </div>
        </div>

        {/* Payment Terms */}
        {paymentTerms && (
          <div className="mt-6">
            <p className="font-bold text-[8px] mb-1">Payment Terms</p>
            <p className="text-[8px] text-gray-600 whitespace-pre-line">{paymentTerms}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div>
        <div className="border-t mt-4 pt-3" style={{ borderColor: "#CCCCBB" }}>
          <div className="flex justify-between">
            <div>
              <p className="font-bold mb-1">Payment Information</p>
              <p>E-Transfer: {settings?.etransfer_email || settings?.email || "—"}</p>
            </div>
            {settings && (
              <div className="text-right">
                <p className="font-bold mb-1">{settings.owner_name}</p>
                {(settings.address || settings.city) && (
                  <p>
                    {settings.address}
                    {settings.address && settings.city ? ", " : ""}
                    {settings.city}
                  </p>
                )}
                {settings.province && (
                  <p>
                    {settings.province}, {settings.postal_code}, Canada
                  </p>
                )}
                {settings.phone && <p>{settings.phone}</p>}
                {settings.website && <p>{settings.website}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="border-t mt-3" style={{ borderColor: "#CCCCBB" }} />
      </div>
    </div>
  );
}
