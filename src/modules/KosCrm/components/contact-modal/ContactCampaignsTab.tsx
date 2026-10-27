import React from 'react';
import { Target, Heart, ExternalLink } from 'lucide-react';
import { Contact } from '../../types';

interface Props {
  formData: Contact;
}

export const ContactCampaignsTab: React.FC<Props> = ({ formData }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
          <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600" />
            <span>פעילות קמפיין</span>
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">קמפיין:</span>
              <span className="font-semibold">{formData.campaign_title || 'ללא קמפיין פעיל'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">סכום תרומה / יעד:</span>
              <span className="font-bold text-amber-600">
                ₪{(formData.campaign_amount || 0).toLocaleString('he-IL')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-900 rounded-xl space-y-2">
          <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-purple-600" />
            <span>עמוד שגריר</span>
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">סה"כ גויס:</span>
              <span className="font-bold text-purple-600">
                ₪{(formData.campaign_total_raised || 0).toLocaleString('he-IL')}
              </span>
            </div>
            {formData.ambassador_page_url && (
              <div className="pt-2">
                <a 
                  href={formData.ambassador_page_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>צפה בעמוד השגריר החי</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
