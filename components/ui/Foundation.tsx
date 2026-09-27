import type { HTMLAttributes, ReactNode } from "react";

type ActionTone = "primary" | "secondary" | "neutral" | "danger";
type NoticeTone = "info" | "success" | "warning" | "error";

export function ActionGroup({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-action-group ${className}`.trim()} role="group" {...props} />;
}

export function actionClass(tone: ActionTone = "primary", className = "") {
  return `ui-action ui-action--${tone} ${className}`.trim();
}

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  htmlFor: string;
  help?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

export function Field({ label, htmlFor, help, error, children, className = "", ...props }: FieldProps) {
  return (
    <div className={`ui-field ${error ? "ui-field--error" : ""} ${className}`.trim()} {...props}>
      <label className="ui-field__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {help && <p className="ui-field__help">{help}</p>}
      {error && <p className="ui-field__error" role="alert">{error}</p>}
    </div>
  );
}

type StatusNoticeProps = HTMLAttributes<HTMLDivElement> & {
  tone?: NoticeTone;
  title: ReactNode;
};

export function StatusNotice({ tone = "info", title, children, className = "", ...props }: StatusNoticeProps) {
  const liveProps = tone === "error"
    ? { role: "alert" as const }
    : { role: "status" as const, "aria-live": "polite" as const };
  return (
    <div className={`ui-status ui-status--${tone} ${className}`.trim()} {...liveProps} {...props}>
      <strong className="ui-status__title">{title}</strong>
      {children && <div className="ui-status__body">{children}</div>}
    </div>
  );
}

type ScrollRegionProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  children: ReactNode;
};

export function ScrollRegion({ label, children, className = "", ...props }: ScrollRegionProps) {
  return (
    <div
      className={`ui-scroll-region ${className}`.trim()}
      data-acceptance-scroll-owner="true"
      role="region"
      aria-label={label}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

type ResponsiveTableProps = ScrollRegionProps & {
  hint?: ReactNode;
};

export function ResponsiveTable({ label, hint = "表は横にスクロールできます。", children, className = "", ...props }: ResponsiveTableProps) {
  return (
    <div className="ui-responsive-table">
      <p className="ui-scroll-hint">{hint}</p>
      <ScrollRegion label={label} className={className} {...props}>{children}</ScrollRegion>
    </div>
  );
}

type CodeBlockProps = Omit<ScrollRegionProps, "children"> & {
  children: string;
  language?: string;
};

export function CodeBlock({ label, children, language, className = "", ...props }: CodeBlockProps) {
  return (
    <ScrollRegion label={label} className={`ui-code-region ${className}`.trim()} {...props}>
      <pre><code data-language={language}>{children}</code></pre>
    </ScrollRegion>
  );
}
