import { useState, useRef, useCallback } from 'react';
import ReactDatePicker from 'react-datepicker';
import {
  format,
  parse,
  parseISO,
  isValid,
  setMonth,
  setYear,
  getMonth,
  getYear,
  startOfToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, CircleAlert } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerField.css';

const DISPLAY_FORMAT  = 'dd-MM-yyyy';
const STORAGE_FORMAT  = 'yyyy-MM-dd';
const TODAY           = startOfToday();
const CURRENT_YEAR    = getYear(TODAY);
const YEAR_RANGE_START = CURRENT_YEAR - 5;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

const YEARS = Array.from(
  { length: CURRENT_YEAR - YEAR_RANGE_START + 1 },
  (_, i) => CURRENT_YEAR - i
);

/**
 * Custom header for the date picker.
 */
const CalendarHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  changeMonth,
  changeYear,
}) => {
  const currentMonth = getMonth(date);
  const currentYear  = getYear(date);

  return (
    <div className="dpf-header">
      <button
        type="button"
        className="dpf-header__nav"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="dpf-header__selects">
        {/* Month select */}
        <div className="dpf-header__select-wrapper">
          <select
            className="dpf-header__select"
            value={currentMonth}
            onChange={(e) => changeMonth(Number(e.target.value))}
            aria-label="Select month"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <ChevronRight size={12} className="dpf-header__select-chevron" aria-hidden="true" />
        </div>

        {/* Year select */}
        <div className="dpf-header__select-wrapper">
          <select
            className="dpf-header__select"
            value={currentYear}
            onChange={(e) => changeYear(Number(e.target.value))}
            aria-label="Select year"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <ChevronRight size={12} className="dpf-header__select-chevron" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        className="dpf-header__nav"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/**
 * Date picker with text entry and calendar selection.
 */
const DatePickerField = ({ id, label, required = false, value, onChange, error }) => {
  const selectedDate = (() => {
    if (!value) return null;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  })();

  const displayValue = selectedDate ? format(selectedDate, DISPLAY_FORMAT) : '';
  const [inputText, setInputText]   = useState(displayValue);
  const [isOpen, setIsOpen]         = useState(false);
  const inputRef                    = useRef(null);

  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    const sync = selectedDate ? format(selectedDate, DISPLAY_FORMAT) : '';
    if (sync !== inputText) setInputText(sync);
  }

  const handleCalendarChange = useCallback((date) => {
    if (!date) {
      onChange('');
      setInputText('');
    } else {
      onChange(format(date, STORAGE_FORMAT));
      setInputText(format(date, DISPLAY_FORMAT));
    }
    setIsOpen(false);
  }, [onChange]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const commitText = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      onChange('');
      setInputText('');
      return;
    }
    const parsed = parse(trimmed, DISPLAY_FORMAT, new Date());
    if (isValid(parsed) && parsed <= TODAY) {
      onChange(format(parsed, STORAGE_FORMAT));
      setInputText(format(parsed, DISPLAY_FORMAT));
    } else {
      setInputText(selectedDate ? format(selectedDate, DISPLAY_FORMAT) : '');
    }
  }, [onChange, selectedDate]);

  const handleBlur = () => {
    commitText(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitText(inputText);
      setIsOpen(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const openToDate = selectedDate ?? TODAY;

  const labelClass = `date-picker-field__label${required ? ' date-picker-field__label--required' : ''}`;

  const inputClass = [
    'date-picker-field__input',
    error  ? 'date-picker-field__input--error' : '',
    isOpen ? 'date-picker-field__input--open'  : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="date-picker-field">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="date-picker-field__input-wrapper">
        {/* Manual text input — always visible */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={inputClass}
          value={inputText}
          placeholder="DD-MM-YYYY"
          maxLength={10}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={`${label}${required ? ', required' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          autoComplete="off"
        />

        {/* Calendar toggle icon */}
        <button
          type="button"
          className="date-picker-field__icon-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          tabIndex={-1}
          aria-label="Open calendar"
          aria-expanded={isOpen}
        >
          <Calendar size={16} />
        </button>

        {/* react-datepicker — popup only, no visible input of its own */}
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleCalendarChange}
          openToDate={openToDate}
          maxDate={TODAY}
          open={isOpen}
          onClickOutside={() => setIsOpen(false)}
          showPopperArrow={false}
          popperClassName="date-picker-field-popper"
          popperPlacement="bottom-start"
          renderCustomHeader={(headerProps) => <CalendarHeader {...headerProps} />}
          /* hide the library's own input — we render ours above */
          customInput={<span style={{ display: 'none' }} />}
          /* prevent library from auto-closing on outside click before our handler */
          shouldCloseOnSelect={true}
        />
      </div>

      {error && (
        <span id={`${id}-error`} className="date-picker-field__message" role="alert">
          <CircleAlert size={12} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
};

export default DatePickerField;
