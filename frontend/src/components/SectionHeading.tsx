type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  accent?: string;
};

export function SectionHeading({ eyebrow, title, accent }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}{accent && <> <em>{accent}</em></>}</h2>
    </div>
  );
}
