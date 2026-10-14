import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

// Rótulo, campo e mensagem de erro (o erro usa o id `${id}-error`).
export function FormField({
  id,
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {/* Um único filho: o Label espaça os filhos com gap. */}
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
