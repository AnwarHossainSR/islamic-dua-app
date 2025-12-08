/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

/**
 * Why Did You Render (WDYR) - Development tool to detect unnecessary re-renders
 * Only runs in development mode
 *
 * To track a component, add this to your component:
 * ComponentName.whyDidYouRender = true;
 *
 * Or track all components:
 * trackAllPureComponents: true
 */

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');

  whyDidYouRender.default(React, {
    trackAllPureComponents: false, // Set to true to track all components
    trackHooks: true,
    logOnDifferentValues: true,
    collapseGroups: true,
  });

  console.log('🔍 Why Did You Render is enabled');
}
