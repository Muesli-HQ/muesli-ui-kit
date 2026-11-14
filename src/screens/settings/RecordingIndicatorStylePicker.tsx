// RecordingIndicatorStylePicker.swift @ v0.8.6 (RecordingIndicatorStyle, RecordingIndicatorStylePicker, RecordingIndicatorPreview).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {Symbol, MuesliMark} from '../../icons/Icon';
import {font, type} from '../../typography';
import {recordingIndicatorAccent} from '../indicator/NotchIndicator';
import {systemLabel, systemSecondaryLabel} from './controls';

export type RecordingIndicatorStyle = 'classic' | 'minimal' | 'notch';
export const RECORDING_INDICATOR_STYLES: Array<{id: RecordingIndicatorStyle; title: string; description: string}> = [
  {id: 'classic', title: 'Classic', description: 'A compact floating capsule.'},
  {id: 'minimal', title: 'Minimal', description: 'A quiet bar until you need it.'},
  {id: 'notch', title: 'Notch', description: 'Activity around your camera notch.'},
];

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** bars(): five 3pt capsules, heights [9, 16, 21, 16, 9], spacing 3. */
const PreviewBars: React.FC<{color: string}> = ({color}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 3}}>
    {[9, 16, 21, 16, 9].map((h, i) => (
      <div key={i} style={{width: 3, height: h, borderRadius: 1.5, background: color}} />
    ))}
  </div>
);

const Logo: React.FC = () => <MuesliMark color="#FFFFFF" box={22} />;

const Sample: React.FC<{style: RecordingIndicatorStyle; active: boolean; accent: string}> = ({style, active, accent}) => {
  let body: React.ReactNode;
  if (style === 'notch') {
    body = (
      <div style={{width: 240, height: 30, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: 'rgba(255,255,255,0.18)'}}>
        <div style={{position: 'relative', height: 30, display: 'flex', background: '#000000', borderRadius: '0 0 10px 10px', color: '#FFFFFF'}}>
          {active ? (
            <div style={{width: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4}}>
              <div style={{width: 16, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.7)'}}>
                <Logo />
              </div>
              <span style={{...font(8), color: '#FFFFFF'}}>Listening</span>
            </div>
          ) : null}
          <div style={{width: 74, background: '#000000'}} />
          {active ? (
            <div style={{width: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <div style={{transform: 'scale(0.75)'}}>
                <PreviewBars color={accent} />
              </div>
              <Symbol name="xmark" size={8} weight="regular" color="#FFFFFF" />
            </div>
          ) : null}
          {active ? <div style={{position: 'absolute', inset: 0, borderRadius: '0 0 10px 10px', boxShadow: `inset 0 0 0 0.7px ${hexA(accent, 0.45)}`}} /> : null}
        </div>
      </div>
    );
  } else if (!active && style === 'minimal') {
    body = (
      <div style={{height: 34, display: 'flex', alignItems: 'center'}}>
        <div style={{width: 64, height: 5, borderRadius: 2.5, background: 'rgba(0,0,0,0.4)'}} />
      </div>
    );
  } else {
    body = (
      <div
        style={{
          width: active ? 138 : 66,
          height: 34,
          borderRadius: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 17,
          background: active ? hexA(accent, 0.85) : 'rgba(18,18,18,1)',
          boxShadow: 'inset 0 0 0 0.75px rgba(255,255,255,0.35), 0 3px 10px rgba(0,0,0,0.22)',
        }}
      >
        {active ? (
          <>
            <Symbol name="xmark" size={10} weight="regular" color="#FFFFFF" />
            <PreviewBars color="#FFFFFF" />
            <Symbol name="stop.fill" size={9} weight="regular" color="#FFFFFF" />
          </>
        ) : (
          <Logo />
        )}
      </div>
    );
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
      <span style={{...font(11), color: 'rgba(0,0,0,0.7)'}}>{active ? 'Recording' : 'At rest'}</span>
      <div style={{height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{body}</div>
    </div>
  );
};

/** RecordingIndicatorPreview: a 240×200 scene scaled to fit, on a grey gradient. */
export const RecordingIndicatorPreview: React.FC<{style: RecordingIndicatorStyle; accent: string; width: number; height?: number}> = ({style, accent, width, height = 200}) => {
  const scale = Math.min(1, width / 240);
  return (
    <div style={{width, height, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgb(163,163,163), rgb(194,194,194))'}}>
      <div style={{position: 'absolute', left: (width - 240) / 2, top: (height - 200) / 2, width: 240, height: 200, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <Sample style={style} active={false} accent={accent} />
        <Sample style={style} active accent={accent} />
      </div>
    </div>
  );
};

/** The three-card picker (adaptive grid, min 210, spacing 12, capped at 3 columns and centred). */
export const RecordingIndicatorStylePicker: React.FC<{selection: RecordingIndicatorStyle; recordingColorHex?: string; contentWidth: number}> = ({selection, recordingColorHex = '1e1e2e', contentWidth}) => {
  const {colors, isDark} = useMuesliTheme();
  const accent = recordingIndicatorAccent(recordingColorHex);
  const gridWidth = Math.min(contentWidth, 3 * 210 + 2 * 12);
  const cols = Math.max(1, Math.min(3, Math.floor((gridWidth + 12) / (210 + 12))));
  const cardWidth = (gridWidth - (cols - 1) * 12) / cols;
  const primary = colors.textPrimary.replace(/[\d.]+\)$/, '0.025)');
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{width: gridWidth, display: 'flex', flexWrap: 'wrap', gap: 12}}>
        {RECORDING_INDICATOR_STYLES.map((s) => {
          const on = selection === s.id;
          return (
            <div
              key={s.id}
              style={{
                width: cardWidth,
                boxSizing: 'border-box',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                borderRadius: 12,
                background: primary,
                boxShadow: `inset 0 0 0 ${on ? 2 : 1}px ${on ? colors.accentText : colors.surfaceBorder}`,
              }}
            >
              <div style={{borderRadius: 8, overflow: 'hidden'}}>
                <RecordingIndicatorPreview style={s.id} accent={accent} width={cardWidth - 24} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%'}}>
                <Symbol name={on ? 'largecircle.fill.circle' : 'circle'} size={15} weight="semibold" color={on ? colors.accentText : colors.textSecondary} />
                <span style={{...type.headline, color: systemLabel(isDark)}}>{s.title}</span>
              </div>
              <div style={{...type.caption, color: systemSecondaryLabel(isDark), textAlign: 'center', minHeight: 32, width: '100%'}}>{s.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
