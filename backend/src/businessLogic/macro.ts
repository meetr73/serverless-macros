import * as uuid from 'uuid'
import { MacroItem } from '../models/MacroItem'
import { MacroUpdate } from '../models/MacroUpdate'
import { MacroAccess  } from '../dataLayer/macroAccess'
import { CreateMacroRequest } from '../requests/CreateMacroRequest'
import { UpdateMacrosRequest } from '../requests/UpdateMacrosRequest'
import { parseUserId } from '../auth/utils'
const macroAccess = new MacroAccess()

export async function getAllGroups(   jwtToken: string): Promise<MacroItem[]> {

  return macroAccess.getAllMacros(jwtToken);

}


export async function createMacro(
  CreateMacroRequest: CreateMacroRequest,
  jwtToken: string
): Promise<MacroItem> {

  const macroId = uuid.v4()
  const userId = parseUserId(jwtToken)
  const createdAt = new Date().toISOString()
  return await macroAccess.createMacro({
    macroId: macroId,
    createdAt:createdAt,
    userId: userId,
    name: CreateMacroRequest.name,
    dueDate: CreateMacroRequest.dueDate,
    done:false,
    protein:CreateMacroRequest.protein,
    fat:CreateMacroRequest.fat,
    carbs:CreateMacroRequest.carbs
  })
}



export async function updateMacros(
  macroId: string,
  UpdateMacrosRequest: UpdateMacrosRequest,
  jwtToken: string
): Promise<MacroUpdate> {


  return await macroAccess.updateMacros({
    name: UpdateMacrosRequest.name,
    dueDate: UpdateMacrosRequest.dueDate,
    done:UpdateMacrosRequest.done,
    protein : UpdateMacrosRequest.protein,
    fat:UpdateMacrosRequest.fat,
    carbs:UpdateMacrosRequest.carbs
  },macroId,jwtToken)
}
