import './Button.css';

/**
 * Generic button component for ClaimIt.
 *
 * @param {object}  props
 * @param {React.ReactNode} [props.children='Button']          - Button label/content.
 * @param {'primary'|'danger'|'ghost'} [props.variant='ghost'] - Visual style variant.
 * @returns {JSX.Element}
 */
const Button = ({ children = 'Button', variant = 'ghost', ...props }) => {
  return (
    <button type="button" className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
