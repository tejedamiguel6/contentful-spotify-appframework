import Field from "./Field";
import { render } from "@testing-library/react";
import { mockCma, mockSdk } from "../../test/mocks";
import { vi } from "vitest";

vi.mock("@contentful/react-apps-toolkit", () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

describe("Field component", () => {
  it("shows a warning for field ids without a configured editor", () => {
    const { getByText } = render(<Field />);

    expect(getByText(/No editor is configured/)).toBeInTheDocument();
  });
});
