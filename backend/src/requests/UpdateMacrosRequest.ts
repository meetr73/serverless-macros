/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateMacrosRequest {
  name: string
  dueDate: string
  done: boolean
  protein:number
  fat:number
  carbs:number
}
