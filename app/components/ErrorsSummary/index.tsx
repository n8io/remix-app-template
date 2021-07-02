interface Props {
  errors?: Record<string, any>;
}

const ErrorsSummary = ({ errors = {} }: Props) => {
  if (!Object.keys(errors).length) return null;

  const items = Object.entries(errors);

  return (
    <ul style={{ color: "red" }}>
      {items.map(([key, value]) => (
        <li key={key}>{value}</li>
      ))}
    </ul>
  );
};

export { ErrorsSummary };
