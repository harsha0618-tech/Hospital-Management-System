import { useState } from "react";

function EntryForm({ fields, onSubmit, submitLabel = "Add Entry" }) {
  const initialState = {};
  fields.forEach((f) => (initialState[f.name] = f.defaultValue || ""));

  const [formData, setFormData] = useState(initialState);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialState); // reset after submit
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            {field.label}
          </label>

          {field.type === "select" ? (
            <select
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || "text"}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ""}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              required={field.required}
            />
          )}
        </div>
      ))}

      <div className="sm:col-span-2 flex justify-end mt-2">
        <button
          type="submit"
          className="bg-gray-800 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default EntryForm;