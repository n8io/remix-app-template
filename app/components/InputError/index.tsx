import { FadeIn } from "../FadeIn";
import stylesUrl from "./index.css";

interface Props {
  error?: string;
}

const InputError = ({ error }: Props) =>
  error ? (
    <FadeIn className="input-error">{error}</FadeIn>
  ) : (
    <div className="input-error">&nbsp;</div>
  );

const links = [{ rel: "stylesheet", href: stylesUrl }];

InputError.links = links;

export { InputError };
