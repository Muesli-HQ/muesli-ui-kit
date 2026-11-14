// Gallery: Vidshots page (dashboard tab) + capture overlays (pill, picker, ink).
import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, layout, type Appearance, type SidebarProps} from '../../../src';
import {
  CapturePickerOverlay,
  InkOverlay,
  VidshotPill,
  VidshotPillOverlay,
  VidshotsPage,
  type VidshotPillState,
  type VidshotRecord,
} from '../../../src/screens/vidshots';
import {vidshotInkStrokes, vidshotProcessing, vidshotRecords, vidshotWaveLevels} from '../../../src/fixtures/vidshots';
import {KitFrame} from '../KitFrame';

const W = layout.windowWidth;
const H = layout.contentHeight;
export const SCREEN_W = 1440;
export const SCREEN_H = 900;

const sidebar: SidebarProps = {
  selected: 'vidshots',
  userName: 'Maya',
  totalMeetingCount: 214,
  folders: [{name: 'Customer calls', count: 48}, {name: 'Hiring', count: 17}],
};

// ---------- Fictional "desktop" pieces (not Muesli UI) ----------

/** A generic web-app screenshot used as a thumbnail / poster / desktop window body. */
export const MockCheckout: React.FC<{scale?: number}> = ({scale = 1}) => {
  const u = (n: number) => n * scale;
  return (
    <div style={{width: '100%', height: '100%', background: '#F4F5F7', fontFamily: 'Helvetica, Arial, sans-serif', display: 'flex', flexDirection: 'column'}}>
      <div style={{height: u(44), background: '#1F2A44', display: 'flex', alignItems: 'center', padding: `0 ${u(20)}px`, color: '#fff', fontWeight: 700, fontSize: u(16)}}>
        Brightline
      </div>
      <div style={{flex: 1, display: 'flex', gap: u(20), padding: u(24)}}>
        <div style={{flex: 1.4, background: '#fff', borderRadius: u(8), padding: u(18), display: 'flex', flexDirection: 'column', gap: u(12)}}>
          <div style={{fontSize: u(18), fontWeight: 700, color: '#1F2A44'}}>Checkout</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{display: 'flex', gap: u(12), alignItems: 'center'}}>
              <div style={{width: u(48), height: u(48), borderRadius: u(6), background: ['#F2C6A0', '#B8D8E8', '#D7C8EE'][i]}} />
              <div style={{flex: 1, height: u(10), background: '#E3E6EB', borderRadius: u(4)}} />
              <div style={{width: u(50), height: u(10), background: '#E3E6EB', borderRadius: u(4)}} />
            </div>
          ))}
          <div style={{display: 'flex', gap: u(8), marginTop: u(8)}}>
            <div style={{flex: 1, height: u(34), border: '1px solid #D5D9E0', borderRadius: u(6), background: '#fff'}} />
            <div style={{width: u(80), height: u(34), borderRadius: u(6), background: '#1F2A44'}} />
          </div>
        </div>
        <div style={{flex: 1, background: '#fff', borderRadius: u(8), padding: u(18), display: 'flex', flexDirection: 'column', gap: u(10)}}>
          <div style={{fontSize: u(14), fontWeight: 700, color: '#1F2A44'}}>Order summary</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{height: u(10), background: '#E3E6EB', borderRadius: u(4), width: `${90 - i * 15}%`}} />
          ))}
          <div style={{flex: 1}} />
          <div style={{height: u(42), borderRadius: u(8), background: '#A9B3C4'}} />
        </div>
      </div>
    </div>
  );
};

export const Wallpaper: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'relative', width: SCREEN_W, height: SCREEN_H, overflow: 'hidden', background: 'linear-gradient(135deg, #3B4A6B 0%, #6C5B7B 55%, #C06C84 100%)'}}>
    {/* menu bar */}
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 28, background: 'rgba(255,255,255,0.18)'}} />
    {children}
  </div>
);

/** A browser-like window at a fixed rect. */
export const BROWSER = {x: 160, y: 110, width: 960, height: 640};
export const BrowserWindow: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: BROWSER.x,
      top: BROWSER.y,
      width: BROWSER.width,
      height: BROWSER.height,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{height: 38, background: '#E9E9EC', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
      ))}
      <div style={{marginLeft: 80, flex: 1, maxWidth: 420, height: 22, borderRadius: 6, background: '#fff'}} />
    </div>
    <div style={{flex: 1}}>
      <MockCheckout />
    </div>
  </div>
);

// ---------- Compositions ----------

const preview = () => <MockCheckout scale={0.28} />;

const PageList: React.FC<{appearance: Appearance; hovered?: boolean}> = ({appearance, hovered}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar}>
      <VidshotsPage
        records={[vidshotProcessing, ...vidshotRecords]}
        renderPreview={(r: VidshotRecord) => (r.state === 'processing' ? null : preview())}
        rowProps={hovered ? {'vs-0412': {hovered: true}} : undefined}
      />
    </DashboardContent>
  </KitFrame>
);

const PageEmpty: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar}>
      <VidshotsPage records={[]} recordButton={{enabled: false}} />
    </DashboardContent>
  </KitFrame>
);

const PageDetail: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar}>
      <VidshotsPage
        records={vidshotRecords}
        selectedId="vs-0412"
        renderPreview={() => (
          // AVPlayerView videoGravity .resizeAspect: letterbox a 3:2 capture inside the player.
          <div style={{height: '100%', aspectRatio: '3 / 2', margin: '0 auto'}}>
            <MockCheckout scale={0.3} />
          </div>
        )}
        detailProps={{playerControlsVisible: true, playerProgress: 0.35, playerHeight: 220}}
      />
    </DashboardContent>
  </KitFrame>
);

const PILL_STATES: Array<{label: string; state: VidshotPillState; copy?: boolean}> = [
  {label: 'preparing', state: {kind: 'preparing'}},
  {label: 'recording', state: {kind: 'recording', seconds: 23}},
  {label: 'recording · dead mic', state: {kind: 'recording', seconds: 4, deadMicrophone: true}},
  {label: 'processing', state: {kind: 'processing'}},
  {label: 'ready', state: {kind: 'ready'}},
  {label: 'recovered', state: {kind: 'recovered'}},
  {label: 'copied', state: {kind: 'copied'}},
  {label: 'copied · partial', state: {kind: 'copied', partial: 'no transcript'}},
  {label: 'readyToCopy', state: {kind: 'readyToCopy', partial: 'frames failed'}},
  {label: 'ready · copy unavailable', state: {kind: 'ready'}, copy: false},
  {label: 'blocked', state: {kind: 'blocked', permission: 'Screen Recording'}},
  {label: 'busy', state: {kind: 'busy', activity: 'Wait for feedback processing'}},
  {label: 'failed (retained)', state: {kind: 'failed', stage: 'Saving', message: 'Disk full', retainedMedia: true}},
  {label: 'failed', state: {kind: 'failed', stage: 'Preparation', message: 'Display unavailable', retainedMedia: false}},
];

const PillStates: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance} background="linear-gradient(135deg, #3B4A6B 0%, #6C5B7B 55%, #C06C84 100%)">
    <div style={{padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'center'}}>
      {PILL_STATES.map((p) => (
        <div key={p.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
          <span style={{fontFamily: 'Menlo, monospace', fontSize: 11, color: 'rgba(255,255,255,0.8)'}}>{p.label}</span>
          <VidshotPill state={p.state} levels={vidshotWaveLevels} copyAvailable={p.copy ?? true} spinnerPhase={0.3} />
        </div>
      ))}
    </div>
  </KitFrame>
);

const Picker: React.FC<{drag?: boolean}> = ({drag}) => (
  <KitFrame>
    <Wallpaper>
      <BrowserWindow />
      <div style={{position: 'absolute', inset: 0}}>
        <CapturePickerOverlay
          width={SCREEN_W}
          height={SCREEN_H}
          highlight={drag ? {x: 420, y: 330, width: 560, height: 300} : BROWSER}
        />
      </div>
    </Wallpaper>
  </KitFrame>
);

const Recording: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance}>
    <Wallpaper>
      <BrowserWindow />
      <div style={{position: 'absolute', inset: 0}}>
        <InkOverlay
          width={SCREEN_W}
          height={SCREEN_H}
          target={BROWSER}
          showsBoundary
          strokes={[{...vidshotInkStrokes[0], progress: 0.85}, vidshotInkStrokes[1]]}
        />
      </div>
      <div style={{position: 'absolute', inset: 0}}>
        <VidshotPillOverlay
          screenWidth={SCREEN_W}
          screenHeight={SCREEN_H}
          state={{kind: 'recording', seconds: 19}}
          levels={vidshotWaveLevels}
        />
      </div>
    </Wallpaper>
  </KitFrame>
);

export const Root: React.FC = () => (
  <>
    {(['dark', 'light'] as Appearance[]).map((a) => (
      <React.Fragment key={a}>
        <Composition id={`Vidshots-page-${a}`} component={() => <PageList appearance={a} />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Vidshots-hover-${a}`} component={() => <PageList appearance={a} hovered />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Vidshots-empty-${a}`} component={() => <PageEmpty appearance={a} />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Vidshots-detail-${a}`} component={() => <PageDetail appearance={a} />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Vidshots-pills-${a}`} component={() => <PillStates appearance={a} />} durationInFrames={1} fps={30} width={900} height={600} />
        <Composition id={`Vidshots-recording-${a}`} component={() => <Recording appearance={a} />} durationInFrames={1} fps={30} width={SCREEN_W} height={SCREEN_H} />
      </React.Fragment>
    ))}
    <Composition id="Vidshots-picker-window" component={() => <Picker />} durationInFrames={1} fps={30} width={SCREEN_W} height={SCREEN_H} />
    <Composition id="Vidshots-picker-region" component={() => <Picker drag />} durationInFrames={1} fps={30} width={SCREEN_W} height={SCREEN_H} />
  </>
);

