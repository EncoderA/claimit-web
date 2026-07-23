import './Table.css';

/**
 * Generic table scaffold for listing records and transactions.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children='Table Component'] Table content.
 * @returns {JSX.Element}
 */
const Table = ({ children = 'Table Component', ...props }) => {
  return (
    <div className="table" {...props}>
      {children}
    </div>
  );
};

export default Table;
