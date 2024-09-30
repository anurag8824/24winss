export default function RadioButton({ label, value,onClick }) {
  return (
    <button
    
      type="button"
      role="radio"
      aria-checked={"false"}
      tabIndex="-1"
      className="radio-group__button buttona"
      data-label={label}
      data-value={value}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
