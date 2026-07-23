import './Card.css';

/**
 * Generic card scaffold for grouping related content in dashboards and forms.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.title='Card'] Optional card title.
 * @param {React.ReactNode} [props.children] Card body content.
 * @returns {JSX.Element}
 */
const Card = ({ title = 'Card', children, ...props }) => {
  return (
    <section className="card" {...props}>
      <h3 className="card__title">{title}</h3>
      <div className="card__body">{children}</div>
    </section>
  );
};

export default Card;
