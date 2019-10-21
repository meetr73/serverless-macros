export interface MacroItem {
  userId: string
  macroId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  protein:number
  fat:number
  carbs:number
}
