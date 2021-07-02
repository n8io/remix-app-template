import { ReactNode } from "react";
import { FadeIn } from "../FadeIn";
import stylesUrl from "./index.css";

interface Props {
  children: ReactNode;
}

const InputError = ({ children }: Props) => (
  <FadeIn className="input-error">{children}</FadeIn>
);

const links = [{ rel: "stylesheet", href: stylesUrl }];

InputError.links = links;

export { InputError };
