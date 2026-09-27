import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionGroup, CodeBlock, Field, ResponsiveTable, StatusNotice, actionClass } from "@/components/ui/Foundation";

describe("foundation primitives", () => {
  it("exposes semantic action and field contracts", () => {
    render(<><ActionGroup aria-label="actions"><button className={actionClass("secondary")} aria-busy="true">Continue</button></ActionGroup><Field label="Game idea" htmlFor="idea" help="Keep it concrete" error="Required"><textarea aria-describedby="idea-counter" /></Field></>);
    expect(screen.getByRole("group", { name: "actions" }).className).toContain("ui-action-group");
    expect(screen.getByRole("button").className).toContain("ui-action--secondary");
    expect(screen.getByRole("button", { name: "Continue" }).getAttribute("aria-busy")).toBe("true");
    const field = screen.getByLabelText("Game idea");
    expect(field.id).toBe("idea");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    const descriptions = field.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(descriptions[0]).toBe("idea-counter");
    expect(descriptions.slice(1).every((id) => document.getElementById(id))).toBe(true);
    expect(screen.getByRole("alert").textContent).toContain("Required");
  });

  it("makes table and code overflow owned, labelled and keyboard reachable", () => {
    render(<><ResponsiveTable label="Candidate comparison"><table><caption>Candidates</caption><thead><tr><th scope="col">Name</th></tr></thead></table></ResponsiveTable><CodeBlock label="Generated code">{"const veryLongToken = 'value';"}</CodeBlock></>);
    for (const region of screen.getAllByRole("region")) {
      expect(region.getAttribute("data-acceptance-scroll-owner")).toBe("true");
      expect(region.getAttribute("tabindex")).toBe("0");
    }
    expect(screen.getByText("Candidates").closest("caption")).toBeTruthy();
  });

  it("announces status severity without relying on color", () => {
    const { rerender } = render(<StatusNotice title="Saved" tone="success">Ready</StatusNotice>);
    expect(screen.getByRole("status").textContent).toContain("SavedReady");
    rerender(<StatusNotice title="Could not save" tone="error">Retry</StatusNotice>);
    expect(screen.getByText("Could not save").closest('[role="alert"]')?.textContent).toContain("Could not saveRetry");
  });
});
