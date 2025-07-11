"use client";

import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import classnames from "classnames";

export default function TodoTextInput({
  initial,
  placeholder,
  onBlur,
  onSubmit,
}: {
  initial: string;
  placeholder?: string;
  onBlur?: (text: string) => void;
  onSubmit: (text: string) => void;
}) {
  const [textInput, setTextInput] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(textInput);
      setTextInput("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(textInput);
    }
  };

  return (
    <input
      ref={ref}
      className={classnames({
        edit: initial !== "",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "new-todo": initial === "",
      })}
      type="text"
      placeholder={placeholder}
      autoFocus={true}
      value={textInput}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleSubmit}
    />
  );
}
