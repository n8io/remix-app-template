import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

const FadeIn = ({ children, className, ...props }: Props) => {
  const [isMounted, beMounted] = useState(false);

  useEffect(() => {
    const to = setTimeout(() => beMounted(true), 10);

    return () => clearTimeout(to);
  }, []);

  const newProps = {
    style: {
      opacity: isMounted ? 1 : 0,
      transition: isMounted ? "opacity 300ms ease-in" : "",
    },
  };

  return (
    <div {...props} {...newProps} className={className}>
      {children}
    </div>
  );
};

export { FadeIn };
