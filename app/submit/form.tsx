"use client";
import React, { useState, useEffect } from "react";
import { FormField } from '@/app/types/achievementFields';

interface DynamicFormProps {
  title?: string;
  fields: FormField[];
  submitButtonText?: string;
  onSubmit: (formData: Record<string, any>) => void;
  initialValues?: Record<string, any>; // Add initialValues prop
}

export default function DynamicForm({ 
  title = "Form", 
  fields, 
  submitButtonText = "Submit", 
  onSubmit, 
  initialValues = {} // Default to an empty object
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues); // Initialize with initialValues
  const [errors, setErrors] = useState<Record<string, string>>({});
  // console.log("Form Data:", formData);
  useEffect(() => {
    setFormData(initialValues); // Update formData when initialValues change
  }, [initialValues]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const { name, type, label, placeholder, required = true, options } = field;
    const fieldLabel = label || name;
    const hasError = !!errors[name];
    
    switch (type) {
      case "document":
        return (
          <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium">
              {fieldLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={name}
              type="file"
              accept="image/*, application/pdf"
              required={required}
              onChange={(e) => handleChange(name, e.target.files?.[0] || null)}
              className={`block w-full text-sm border rounded p-2 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hasError && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
          </div>
        );
        
      case "option":
        return (
          <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium">
              {fieldLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={name}
              required={required}
              value={formData[name] || ""}
              onChange={(e) => handleChange(name, e.target.value)}
              className={`block w-full border rounded px-3 py-2 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="" disabled>
                {placeholder || `Select ${fieldLabel}`}
              </option>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
          </div>
        );
        
      case "text":
      default:
        return (
          <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium">
              {fieldLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={name}
              type="text"
              required={required}
              placeholder={placeholder}
              value={formData[name] || ""}
              onChange={(e) => handleChange(name, e.target.value)}
              //BLOCKED
              disabled={field.blocked?field.blocked:false}
              className={`block w-full border rounded px-3 py-2 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hasError && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name}>{renderField(field)}</div>
        ))}
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}