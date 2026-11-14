// TimeTurnerFocusPresenter (TimeTurnerFocusPresenter.swift @ v0.8.6): a borderless full-screen panel
// with a black backdrop at 20% (0.24s fade in, 0.18s out) hosting MemoryExplorerView (non-inline),
// sized min(1280, visible.width − 64) × min(900, visible.height − 48), centred in the visible frame.
import React from 'react';
import {MemoryExplorer, type MemoryExplorerProps} from './MemoryExplorer';

export interface TimeTurnerFocusViewerProps extends Omit<MemoryExplorerProps, 'mode' | 'width' | 'height'> {
  /** Visible screen frame the panel covers, in pt. */
  screenWidth: number;
  screenHeight: number;
  /** Backdrop dim progress 0..1 (target alpha 0.20). */
  dim?: number;
  /** Content behind the backdrop (desktop, dashboard window…). */
  children?: React.ReactNode;
}

export const focusViewerSize = (w: number, h: number) => ({
  width: Math.min(1280, Math.max(320, w - 64)),
  height: Math.min(900, Math.max(320, h - 48)),
});

export const TimeTurnerFocusViewer: React.FC<TimeTurnerFocusViewerProps> = ({screenWidth, screenHeight, dim = 1, children, ...explorer}) => {
  const size = focusViewerSize(screenWidth, screenHeight);
  return (
    <div style={{position: 'relative', width: screenWidth, height: screenHeight, overflow: 'hidden'}}>
      {children}
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.2 * dim})`}} />
      <div style={{position: 'absolute', left: (screenWidth - size.width) / 2, top: (screenHeight - size.height) / 2}}>
        <MemoryExplorer {...explorer} mode="focus" width={size.width} height={size.height} />
      </div>
    </div>
  );
};
