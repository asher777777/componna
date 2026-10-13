import React from 'react';
import { useHostCapabilities } from './HostCapabilitiesContext';

export interface CapabilitySlotProps<TProps = any> {
  name: string;
  props?: TProps;
  fallback?: React.ReactNode;
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

  if (!hasCapability(name)) {
    return <>{fallback}</>;
  }

  const CapabilityComponent = getCapability(name);

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
