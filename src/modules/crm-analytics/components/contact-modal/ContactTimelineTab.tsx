import React from 'react';
import { Contact } from '../../types';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

export const ContactTimelineTab: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
          הערות פנימיות
        </label>
        <textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="הערות חשובות על הלקוח..."
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          הגשות טפסים אחרונות
        </h4>
        {formData.form_submissions && formData.form_submissions.length > 0 ? (
          <div className="space-y-2">
            {formData.form_submissions.map((fs, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{fs.name}</p>
                  <p className="text-gray-400 text-[11px]">{fs.page}</p>
                </div>
                <span className="text-gray-400 font-mono text-[11px]">{fs.date}</span>
              </div>
            ))}
          </div>
        ) : formData.last_form_name ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">{formData.last_form_name}</p>
              <p className="text-gray-400 text-[11px]">{formData.last_form_page || ''}</p>
            </div>
            <span className="text-gray-400 font-mono text-[11px]">{formData.last_form_submission_date || ''}</span>
          </div>
        ) : (
          <p className="text-gray-400 py-3 text-center border border-dashed rounded-lg">
            אין טפסים רשומים
          </p>
        )}
      </div>
    </div>
  );
};
