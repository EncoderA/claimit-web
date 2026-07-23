import './Stepper.css';

/**
 * Generic stepper scaffold for multi-step workflows.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children='Stepper'] Stepper content.
 * @returns {JSX.Element}
 */
const Stepper = ({ children = 'Stepper', ...props }) => {
  return (
    <div className="stepper" {...props}>
      {children}
    </div>
  );
};

export default Stepper;
