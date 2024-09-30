import { useEffect, useState, useRef } from "react";
import "./radio.css";

export default function RadioGroup({
  children,
  label = "",
  checkedValue = ""
}) {
  // value to store the checked value
  const [value, setValue] = useState(checkedValue);
  // ref value will persist across re-renders
  let buttonGroupRef = useRef();
  let prevCheckedButtonRef = useRef();

  useEffect(() => {
    // value is the dependancy for this useEffect, whenever it changes, I am setting the attribute for checked button and removing attribute from the previousCheckedButton
    const checkedButton = buttonGroupRef.current.querySelector(
      `button[role="radio"][data-value="${value}"]`
    );
    if (checkedButton) {
      if (prevCheckedButtonRef.current) {
        prevCheckedButtonRef.current.setAttribute("aria-checked", "false");
      }
      checkedButton.setAttribute("aria-checked", "true");
      prevCheckedButtonRef.current = checkedButton;
    }
  }, [value]);

  const clickHandler = (event) => {
    const clickedButton = event.target.closest("button[role='radio']");
    if (clickedButton) {
      setValue(clickedButton.dataset.value);
    }
  };

  return (
    <div className="radio-group" role="radiogroup" aria-label={label}>
      <div
        className="radio-group__button-group"
        ref={buttonGroupRef}
        onClick={clickHandler}
      >
        {children}
      </div>
    </div>
  );
}
