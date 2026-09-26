export type ContactData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  privacy: boolean;
};
export const contactLimits = { name: 160, email: 160, company: 160, phone: 22, message: 5000 };
export type ContactField = keyof ContactData;
export type ValidationKey = `validation.${ContactField}`;
export type ContactErrors = Partial<Record<ContactField, ValidationKey>>;

export function normalizeContact(data: ContactData): ContactData {
  return {
    name: data.name.normalize('NFC').trim(),
    email: data.email.trim(),
    company: data.company.normalize('NFC').trim(),
    phone: data.phone.trim(),
    message: data.message.normalize('NFC').replace(/\r\n?/g, '\n').trim(),
    privacy: data.privacy,
  };
}

export function validateContact(data: ContactData): ContactErrors {
  const errors: ContactErrors = {};
  const clean = normalizeContact(data);
  const singleLineControl = /[\u0000-\u001f\u007f]/;
  for (const field of ['name', 'email', 'company', 'phone'] as const) {
    if (data[field].length > contactLimits[field] || singleLineControl.test(data[field]))
      errors[field] = `validation.${field}`;
  }
  if (clean.name.length < 2) errors.name = 'validation.name';
  // A single mailbox only: never allow header syntax, display names or newlines.
  if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(
      clean.email,
    ) ||
    clean.email.split('@')[0].length > 64
  )
    errors.email = 'validation.email';
  if (!clean.company) errors.company = 'validation.company';
  if (
    clean.phone &&
    (!/^\+?[\d\s().-]{7,22}$/.test(clean.phone) ||
      !/^\d{7,15}$/.test(clean.phone.replace(/\D/g, '')))
  )
    errors.phone = 'validation.phone';
  if (
    clean.message.length < 20 ||
    data.message.length > contactLimits.message ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data.message)
  )
    errors.message = 'validation.message';
  if (data.privacy !== true) errors.privacy = 'validation.privacy';
  return errors;
}
