import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ProfileDataSpotify from "./ProfileData";
import GenresObject from "./Genres";

// Smoke tests that the Forma 36 / field-editor components render with a
// realistic field SDK. Network calls are stubbed out.

function makeSdk(value: unknown) {
  const noopSubscribe = vi.fn(() => () => {});
  return {
    field: {
      id: "test-field",
      locale: "en-US",
      type: "Object",
      required: false,
      validations: [],
      getValue: vi.fn(() => value),
      setValue: vi.fn(() => Promise.resolve(value)),
      removeValue: vi.fn(() => Promise.resolve()),
      setInvalid: vi.fn(),
      getIsDisabled: vi.fn(() => false),
      getSchemaErrors: vi.fn(() => []),
      onValueChanged: noopSubscribe,
      onIsDisabledChanged: noopSubscribe,
      onSchemaErrorsChanged: noopSubscribe,
    },
    window: { updateHeight: vi.fn(), startAutoResizer: vi.fn() },
    entry: { fields: {} },
  };
}

let sdk = makeSdk(null);

vi.mock("@contentful/react-apps-toolkit", () => ({
  useSDK: () => sdk,
}));

vi.mock("../api", () => ({
  apiFetch: vi.fn(() => new Promise(() => {})), // never resolves
  errorMessage: (err: unknown) => String(err),
}));

describe("field editors on Forma 36 v6", () => {
  it("renders the profile JSON editor", () => {
    sdk = makeSdk({ display_name: "test" });
    render(<ProfileDataSpotify />);
    expect(screen.getByText("Profile data from Spotify")).toBeInTheDocument();
  });

  it("renders the genres multiselect with saved values", async () => {
    sdk = makeSdk(["post-punk", "darkwave"]);
    render(<GenresObject />);
    expect(screen.getByText("Select all")).toBeInTheDocument();
    await waitFor(() => expect(sdk.window.updateHeight).toHaveBeenCalledWith(500));
  });
});
