import './StatusChip.css';

/**
 * Generic status chip scaffold for showing status or state labels.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children='Status Chip'] Status text.
 * @returns {JSX.Element}
 */
const StatusChip = ({ children = 'Status Chip', ...props }) => {
  return (
    <span className="status-chip" {...props}>
      {children}
    </span>
  );
};

export default StatusChip;
