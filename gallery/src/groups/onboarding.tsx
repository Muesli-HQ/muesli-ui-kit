// Gallery: first-run onboarding (OnboardingView.swift @ v0.8.6), Dictation + Meetings → all seven steps.
import React from 'react';
import {Composition} from 'remotion';
import {KitFrame} from '../KitFrame';
import {OnboardingWindow, ONBOARDING_SIZE, type OnboardingProps} from '../../../src/screens/onboarding';

const UC = {voiceNotes: false, dictation: true, meetings: true};
const W = ONBOARDING_SIZE.w + 80;
const H = ONBOARDING_SIZE.h + 32 + 80;

const STATES: Array<{id: string; p: OnboardingProps}> = [
  {id: 'welcome', p: {step: 'welcome', useCase: UC, userName: 'Maya', nameCaret: true}},
  {id: 'welcome-empty', p: {step: 'welcome', useCase: {voiceNotes: false, dictation: false, meetings: false}}},
  {id: 'model', p: {step: 'model', useCase: UC}},
  {id: 'hotkey', p: {step: 'hotkey', useCase: UC, hotkey: {label: 'Right Option'}}},
  {id: 'permissions', p: {step: 'permissions', useCase: UC, permissions: {granted: 1}}},
  {id: 'permissions-granted', p: {step: 'permissions', useCase: UC, permissions: {granted: 2, confirming: true}}},
  {id: 'dictation-preparing', p: {step: 'dictationTest', useCase: UC, dictationTest: {phase: 'downloading', progress: 0.42}}},
  {id: 'dictation-ready', p: {step: 'dictationTest', useCase: UC, dictationTest: {phase: 'ready'}}},
  {id: 'dictation-success', p: {step: 'dictationTest', useCase: UC, dictationTest: {phase: 'success', result: 'Testing this one out.'}}},
  {id: 'meeting-summary', p: {step: 'meetingSummary', useCase: UC, summary: {provider: 'ChatGPT', signedIn: true}}},
  {id: 'calendar', p: {step: 'calendarAccess', useCase: UC, calendar: {granted: true}}},
];

export const Root: React.FC = () => (
  <>
    {STATES.map((s) => (
      <Composition
        key={s.id}
        id={`Onboarding-${s.id}`}
        component={() => (
          <KitFrame appearance="dark" background="linear-gradient(135deg, #3B4A6B, #6B4F6E)">
            <div style={{padding: 40}}>
              <OnboardingWindow {...s.p} shadow={false} />
            </div>
          </KitFrame>
        )}
        durationInFrames={1}
        fps={30}
        width={W}
        height={H}
      />
    ))}
  </>
);
