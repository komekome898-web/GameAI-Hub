import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionGroup, CodeBlock, Field, ResponsiveTable, StatusNotice, actionClass } from "@/components/ui/Foundation";

describe("foundation primitives", () => {
  it("exposes semantic action and field contracts", () => {
    render(<><ActionGroup aria-label="actions"><button className={actionClass("secondary")}>Continue</button></ActionGroup><Field label="Game idea" htmlFor="idea" help="Keep it concrete" error="Required"><textarea id="idea" /></Field></>);
    expect(screen.getByRole("group", { name: "actions" }).className).toContain("ui-action-group");
    expect(screen.getByRole("button").className).toContain("ui-action--secondary");
    expect(screen.getByLabelText("Game idea")).toBeTruthy();
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
