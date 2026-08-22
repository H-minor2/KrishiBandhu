'use client'

import React from 'react';
import { getTranslation } from '../../lib/constants/languages';

interface FinancialDetailsInputProps {
  language: string;
  loanAmount: number | '';
  loanDueDate: string;
  onChange: (fields: Partial<{ loan_amount: number | ''; loan_due_date: string }>) => void;
}

export default function FinancialDetailsInput({
  language,
  loanAmount,
  loanDueDate,
  onChange
}: FinancialDetailsInputProps) {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="bg-white border border-black p-5 rounded-none space-y-4">
      <h3 className="text-lg font-bold text-[#003366] border-b border-black pb-2">
        💰 Financial & Agricultural Credit Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loan Amount in ₹ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="loan-amount-input" className="font-bold text-black text-sm">
            {t('loanAmountLabel')}
          </label>
          <div className="flex items-stretch">
            <span className="bg-[#003366] text-white border border-black px-3.5 flex items-center font-bold text-lg">
              ₹
            </span>
            <input
              id="loan-amount-input"
              type="number"
              min="0"
              step="500"
              placeholder="e.g. 50000"
              value={loanAmount}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                onChange({ loan_amount: val });
              }}
              className="w-full border border-black border-l-0 p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] font-semibold"
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter 0 if no active crop loan is borrowed.
          </p>
        </div>

        {/* Loan Due Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="loan-due-date" className="font-bold text-black text-sm">
            📆 {t('loanDueDateLabel')}
          </label>
          <input
            id="loan-due-date"
            type="date"
            value={loanDueDate}
            onChange={(e) => onChange({ loan_due_date: e.target.value })}
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      </div>
    </div>
  );
}
