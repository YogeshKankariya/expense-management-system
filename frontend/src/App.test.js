import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page", () => {
  render(<App />);
  expect(screen.getByText(/expense manager/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
});
