// The following types get cast against the loaded JSON configuration file. The types match
// the structure of the JSON.

import { EmotionBehaviorCode } from '@inworld/web-core';

import { ANIMATION_TYPE, EMOTIONS_BODY, GENDER_TYPES } from '../types/types';

export type AvatarConfiguration = {
  avatar: AvatarType;
};

export type AvatarType = {
  baseURIs: BaseURIsType;
  modelInfo: ModelInfoType;
  defaults: DefaultsType;
  animations: { [key: string]: AvatarAnimationType };
};

export type ModelInfoType = {
  avatarRootName: string
  avatarHeadName: string
};

export type AvatarAnimationType = {
  emotion: EMOTIONS_BODY;
  type: ANIMATION_TYPE;
  file: string;
};

export type BaseURIsType = {
  ANIMATIONS: string;
  MODELS: string;
};

export type DefaultsType = {
  EMOTION: EmotionBehaviorCode;
  GENDER: GENDER_TYPES;
  IDLE_ANIMATION: string;
  MODEL: string;
};

// {
//   "avatar": {
//     "baseURIs": {
//       "ANIMATIONS": "/animations/",
//       "MODELS": "/models/"
//     },
//     "defaults": {
//       "IDLE_ANIMATION": "Neutral_Idle",
//       "EMOTION": "NEUTRAL",
//       "MODEL": "rpm-lz.glb"
//     },
//     "animations": {
//       "Neutral_Idle": {
//         "emotion": "neutral",
//         "type": "idle",
//         "file": "rpm_male_idle.glb"
//       },
//       "Neutral_Talking_01": {
//         "emotion": "neutral",
//         "type": "talking",
//         "file": "rpm_male_talking_01.glb"
//       },
//       "Neutral_Talking_02": {
//         "emotion": "neutral",
//         "type": "talking",
//         "file": "rpm_male_talking_02.glb"
//       },
//       "Neutral_Talking_03": {
//         "emotion": "neutral",
//         "type": "talking",
//         "file": "rpm_male_talking_03.glb"
//       }
//     }
//   }
// }

