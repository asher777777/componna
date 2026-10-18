import React from 'react';
import { useHostCapabilities } from './HostCapabilitiesContext';

export interface CapabilitySlotProps<TProps = any> {
  name: string;
  props?: TProps;
  fallback?: React.ReactNode;
}

const GLOBAL_CAPABILITY_REGISTRY = new Map<string, any>();

/**
 * Register a global UI capability provider without cross-module imports
 */
export function registerCapabilityUI(name: string, component: any) {
  GLOBAL_CAPABILITY_REGISTRY.set(name, component);
}

/**
 * Get registered UI capability provider
 */
export function getRegisteredCapabilityUI(name: string) {
  return GLOBAL_CAPABILITY_REGISTRY.get(name) || null;
}

/**
 * CapabilitySlot: Enables zero cross-module direct imports.
 * Instead of `import { OtherView } from '../../other-module'`,
 * modules render `<CapabilitySlot name="crm-contact-modal" props={{...}} />`.
 */
export const CapabilitySlot: React.FC<CapabilitySlotProps> = ({
  name,
  props = {},
  fallback = null,
}) => {
  const { getCapability, hasCapability } = useHostCapabilities();

  const GlobalComponent = getRegisteredCapabilityUI(name);
  const CapabilityComponent = GlobalComponent || (hasCapability(name) ? getCapability(name) : null);

  if (!CapabilityComponent) {
    return <>{fallback}</>;
  }

  if (typeof CapabilityComponent === 'function' || React.isValidElement(CapabilityComponent)) {
    if (React.isValidElement(CapabilityComponent)) {
      return React.cloneElement(CapabilityComponent as React.ReactElement, props);
    }
    const Comp = CapabilityComponent as React.ComponentType<any>;
    return <Comp {...props} />;
  }

  return <>{fallback}</>;
};

export default CapabilitySlot;
