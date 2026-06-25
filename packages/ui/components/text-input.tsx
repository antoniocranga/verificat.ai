import type { ChangeEvent } from 'react';

interface TextInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

const style: React.CSSProperties = {
  borderRadius: 6,
  padding: '8px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #ebebeb',
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 16,
  lineHeight: 1.5,
  color: '#171717',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export function TextInput({ value, defaultValue, placeholder, onChange, id }: TextInputProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      style={style}
    />
  );
}
