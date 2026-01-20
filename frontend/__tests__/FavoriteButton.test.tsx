import FavoriteButton from "@/components/FavoriteButton";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

describe("FavoriteButton", () => {
  const user = userEvent.setup();

  it("renders favorite off button by default", () => {
    render(<FavoriteButton />);

    expect(screen.queryByTestId("favorite-off")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-on")).not.toBeInTheDocument();
  });

  it("renders favorite off button by default", () => {
    render(<FavoriteButton defaultActive={true} />);

    expect(screen.queryByTestId("favorite-on")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-off")).not.toBeInTheDocument();
  });

  it("toggles state when clicked", async () => {
    render(<FavoriteButton />);

    expect(screen.queryByTestId("favorite-off")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-on")).not.toBeInTheDocument();
    const btn = screen.getByRole("button");

    await user.click(btn);

    expect(screen.queryByTestId("favorite-on")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-off")).not.toBeInTheDocument();

    await user.click(btn);
    expect(screen.queryByTestId("favorite-off")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-on")).not.toBeInTheDocument();
  });

  it("calls the onChange function when clicked", async () => {
    const changeHandler = jest.fn();
    render(<FavoriteButton onChange={changeHandler} />);

    expect(screen.queryByTestId("favorite-off")).toBeInTheDocument();
    expect(screen.queryByTestId("favorite-on")).not.toBeInTheDocument();

    const btn = screen.getByRole("button");

    await user.click(btn);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(true);

    await user.click(btn);
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenCalledWith(false);
  });
});
