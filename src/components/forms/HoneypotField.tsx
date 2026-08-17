type HoneypotFieldProps = {
  registration: {
    name: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    ref: React.Ref<HTMLInputElement>;
  };
};

export function HoneypotField({ registration }: HoneypotFieldProps) {
  return (
    <div className="absolute -left-[10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor={registration.name}>Company website</label>
      <input
        id={registration.name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...registration}
      />
    </div>
  );
}
