import { apiEndpoint } from '../config'
import { Macro } from '../types/Macro';
import { CreateMacroRequest } from '../types/CreateMacroRequest';
import Axios from 'axios'
import { UpdateMacrosRequest } from '../types/UpdateMacrosRequest';

export async function getTodos(idToken: string): Promise<Macro[]> {
  console.log('Fetching todos')

  console.log("apiEndpoint todo" + apiEndpoint)
  console.log("idToken todo " + idToken)
  const response = await Axios.get(`${apiEndpoint}/macros`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}

export async function createMacro(
  idToken: string,
  newTodo: CreateMacroRequest
): Promise<Macro> {
  const response = await Axios.post(`${apiEndpoint}/macros`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,

    }
  })
  return response.data.item
}

/*export async function createMacro(
  idToken: string,
  newTodo: CreateMacroRequest
): Promise<Macro> {
  const response = await Axios.post(`${apiEndpoint}/macros`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,

    }
  })
  let data  = response.data;
  return data
}*/
export async function patchTodo(
  idToken: string,
  macroId: string,
  updatedTodo: UpdateMacrosRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/macros/${macroId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,

    }
  })
}

export async function deleteMacro(
  idToken: string,
  macroId: string
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/macros/${macroId}`,{}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  macroId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/macros/${macroId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,

    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
