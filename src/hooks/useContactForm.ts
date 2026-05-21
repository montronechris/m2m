import { useState } from "react";

type FormStatus = "idle" | "submitting" | "success";

export function useContactForm() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      console.log("Form inviato!");
      setFormStatus("success");
    }, 1500);
  };

  const resetForm = () => setFormStatus("idle");

  return { formStatus, handleSubmit, resetForm };
}
