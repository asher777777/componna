import React from 'react';
import { Contact } from '../../types';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

export const ContactOverviewTab: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 text-sm">
          פרטי זיהוי והתקשרות
        </h3>
        <div>
          <label className="block text-gray-500 mb-1">שם מלא</label>
          <input
            type="text"
            value={formData.conta_name || ''}
            onChange={(e) => onChange('conta_name', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">מספר טלפון / נייד</label>
          <input
            type="text"
            value={formData.conta_phone || ''}
            onChange={(e) => onChange('conta_phone', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">כתובת אימייל</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-500 mb-1">משפחה / קרבה</label>
            <input
              type="text"
              value={formData.f_m || ''}
              onChange={(e) => onChange('f_m', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-1">מין</label>
            <select
              value={formData.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">בחר...</option>
              <option value="זכר">זכר</option>
              <option value="נקבה">נקבה</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 text-sm">
          מיקום ועסק
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-500 mb-1">עיר</label>
            <input
              type="text"
              value={formData.mh_crm_city || ''}
              onChange={(e) => onChange('mh_crm_city', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-1">רחוב ומספר</label>
            <input
              type="text"
              value={formData.mh_crm_street || ''}
              onChange={(e) => onChange('mh_crm_street', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-500 mb-1">חברה / ארגון</label>
          <input
            type="text"
            value={formData.company_name || ''}
            onChange={(e) => onChange('company_name', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">תפקיד</label>
          <input
            type="text"
            value={formData.job_title || ''}
            onChange={(e) => onChange('job_title', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">מקור הגעה (Lead Source)</label>
          <input
            type="text"
            value={formData.lead_source || ''}
            onChange={(e) => onChange('lead_source', e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
};
