'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BrandedDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
}

export default function BrandedDatePicker({
  selected,
  onChange,
  placeholderText = 'Select a date',
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
}: BrandedDatePickerProps) {
  const calendarStyles = `
    .react-datepicker-wrapper {
      width: 100%;
    }

    .react-datepicker__input-container {
      position: relative;
    }

    .branded-datepicker-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid ${secondaryColor};
      border-radius: 4px;
      font-family: ${bodyFontFamily};
      color: ${fontColor};
      background: white;
      font-size: 1rem;
    }

    .branded-datepicker-input:focus {
      outline: none;
      border-color: ${secondaryColor};
      box-shadow: 0 0 0 2px rgba(${secondaryColor.substring(1)}, 0.1);
    }

    .react-datepicker {
      background-color: ${primaryColor};
      border: 1px solid ${secondaryColor};
      border-radius: 4px;
      font-family: ${bodyFontFamily};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .react-datepicker__header {
      background-color: ${primaryColor};
      border-bottom: 1px solid ${secondaryColor};
      padding-top: 1rem;
      color: ${fontColor};
    }

    .react-datepicker__current-month {
      color: ${fontColor};
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .react-datepicker__day-names {
      border-bottom: 1px solid ${secondaryColor}30;
      margin-bottom: 0.5rem;
    }

    .react-datepicker__day-name {
      color: ${fontColor};
      font-weight: 600;
      width: 2.5rem;
      line-height: 2.5rem;
      font-size: 0.75rem;
    }

    .react-datepicker__month {
      margin: 0.5rem;
    }

    .react-datepicker__week {
      white-space: nowrap;
    }

    .react-datepicker__day {
      width: 2.5rem;
      line-height: 2.5rem;
      color: ${fontColor};
      background-color: ${primaryColor};
      border: none;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0.25rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
      background-color: ${secondaryColor}30;
      color: ${fontColor};
    }

    .react-datepicker__day--selected {
      background-color: ${primaryColor};
      color: ${fontColor};
      border: 2px solid ${secondaryColor};
      font-weight: 600;
    }

    .react-datepicker__day--keyboard-selected {
      background-color: ${secondaryColor}30;
      color: ${fontColor};
    }

    .react-datepicker__day--in-selecting-range {
      background-color: ${secondaryColor}30;
      color: ${fontColor};
    }

    .react-datepicker__day--in-range {
      background-color: ${secondaryColor}20;
      color: ${fontColor};
    }

    .react-datepicker__day--highlighted {
      background-color: ${secondaryColor};
      color: ${primaryColor};
      font-weight: 600;
    }

    .react-datepicker__day--today {
      font-weight: 700;
      background-color: ${secondaryColor};
      color: ${primaryColor};
    }

    .react-datepicker__day--disabled {
      color: ${fontColor};
      opacity: 0.4;
      cursor: not-allowed;
    }

    .react-datepicker__day--outside-month {
      color: ${fontColor};
      opacity: 0.3;
    }

    .react-datepicker__navigation {
      background: none;
      border: none;
      line-height: 1.7rem;
      text-indent: -9999px;
      height: 1.7rem;
      width: 1.7rem;
      text-align: center;
      cursor: pointer;
      color: ${fontColor};
    }

    .react-datepicker__navigation--previous {
      left: 1rem;
    }

    .react-datepicker__navigation--next {
      right: 1rem;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${fontColor};
      border-width: 2px 2px 0 0;
      content: '';
      display: block;
      height: 0.5rem;
      width: 0.5rem;
    }

    .react-datepicker__navigation--next .react-datepicker__navigation-icon::before {
      transform: rotate(45deg);
      left: -0.25rem;
    }

    .react-datepicker__navigation--previous .react-datepicker__navigation-icon::before {
      transform: rotate(-135deg);
      right: -0.25rem;
    }

    .react-datepicker__footer {
      background-color: ${primaryColor};
      border-top: 1px solid ${secondaryColor};
      padding: 0.75rem;
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .react-datepicker__today-button,
    .react-datepicker__clear-button {
      background-color: ${primaryColor};
      color: ${fontColor};
      border: 1px solid ${secondaryColor};
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: ${bodyFontFamily};
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .react-datepicker__today-button:hover,
    .react-datepicker__clear-button:hover {
      background-color: ${secondaryColor}30;
      color: ${fontColor};
    }

    .react-datepicker-popper {
      z-index: 1000;
    }
  `;

  return (
    <>
      <style>{calendarStyles}</style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        dateFormat="yyyy-MM-dd"
        className="branded-datepicker-input"
        showMonthDropdown={false}
        showYearDropdown={false}
        todayButton="Today"
        isClearable
        closeOnScroll={true}
      />
    </>
  );
}
