import type { CSSProperties, ReactNode } from "react";

const colors = {
  ink: "#171A1D",
  cream: "#F7F6F2",
  brand: "#F35A18",
  muted: "#6B7178",
  white: "#FFFFFF",
  line: "#E5E7E9",
};

const wrap: CSSProperties = {
  backgroundColor: colors.cream,
  padding: "24px 12px",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: colors.ink,
};

const card: CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  backgroundColor: colors.white,
  border: `1px solid ${colors.line}`,
};

const header: CSSProperties = {
  backgroundColor: colors.ink,
  color: colors.white,
  padding: "20px 24px",
  borderBottom: `4px solid ${colors.brand}`,
};

const body: CSSProperties = {
  padding: "24px",
  fontSize: 15,
  lineHeight: "24px",
};

const footer: CSSProperties = {
  padding: "16px 24px",
  fontSize: 12,
  color: colors.muted,
  borderTop: `1px solid ${colors.line}`,
};

type EmailLayoutProps = {
  title: string;
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ title, preview, children }: EmailLayoutProps) {
  return (
    <div style={wrap}>
      <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>{preview}</div>
      <div style={card}>
        <div style={header}>
          <div style={{ fontSize: 12, letterSpacing: "0.16em", color: colors.brand, fontWeight: 700 }}>
            TRUEFIX360
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{title}</div>
        </div>
        <div style={body}>{children}</div>
        <div style={footer}>
          TrueFix360 property preservation and maintenance. This message may contain
          operational details intended for the named recipient.
        </div>
      </div>
    </div>
  );
}

export function EmailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <tr>
      <td style={{ padding: "6px 0", color: colors.muted, width: 180, verticalAlign: "top" }}>
        {label}
      </td>
      <td style={{ padding: "6px 0", color: colors.ink }}>{String(value)}</td>
    </tr>
  );
}

export function EmailTable({ children }: { children: ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>{children}</tbody>
    </table>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <p style={{ margin: "20px 0 0" }}>
      <a
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: colors.brand,
          color: colors.white,
          textDecoration: "none",
          padding: "12px 18px",
          fontWeight: 700,
        }}
      >
        {label}
      </a>
    </p>
  );
}

export function EmailParagraph({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}
