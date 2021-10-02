import React from "react";

const InputWithLabel = ({id, label, value, type = "text", onInputChange}) => (
    <>
        <label className="InputLabel" htmlFor={id}> {label} </label>
        &nbsp;
        <input className="InputBox" id={id} type={type} value={value} onChange={onInputChange}  autoComplete="off"/>
    </>
)

export default InputWithLabel;