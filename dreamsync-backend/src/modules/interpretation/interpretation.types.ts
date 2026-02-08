// src/modules/interpretation/interpretation.types.ts

export type InterpretationInput = {
    dreamText: string
    mood?: string
    tags?: string[]
  }
  
  export type InterpretationOutput = {
    summary: string
    themes: string[]
    emotionalTone: string
    reflectionPrompts: string[]
    symbolTags: string[]
    wordReflections: {
      word: string
      reflection: string
    }[]
  }
  
