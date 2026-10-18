import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandingActionType } from './types';

export function useBrandingActionRunner() {
  const navigate = useNavigate();

  const runAction = useCallback((actionType: BrandingActionType, payload?: string) => {
    switch (actionType) {
      case 'open_ai_wizard':
        window.dispatchEvent(new CustomEvent('brand_dna_open_wizard'));
        break;

      case 'open_scraper':
        window.dispatchEvent(new CustomEvent('brand_dna_open_scraper'));
        break;

      case 'open_strategy':
        window.dispatchEvent(new CustomEvent('brand_dna_open_strategy'));
        break;

      case 'trigger_market_agent':
      case 'run_market_agent':
        window.dispatchEvent(new CustomEvent('brand_dna_trigger_market_agent'));
        break;

      case 'save_brand_dna':
        window.dispatchEvent(new CustomEvent('brand_dna_trigger_save'));
        break;

      case 'edit_core_services':
        window.dispatchEvent(new CustomEvent('brand_dna_open_services_editor'));
        break;

      case 'switch_branding_tab':
      case 'switch_tab':
        window.dispatchEvent(new CustomEvent('brand_dna_switch_tab', { detail: { tab: payload || 'identity' } }));
        break;

      case 'navigate':
        if (payload) navigate(payload);
        break;

      case 'custom_event':
        window.dispatchEvent(new CustomEvent(payload || 'brand_custom_event'));
        break;

      default:
        console.warn('[BrandingActionRunner] Unrecognized action:', actionType);
    }
  }, [navigate]);

  return { runAction };
}
