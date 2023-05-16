// Get Loadster data

import { PaginationPayload } from "../../types";
import {
  ADD_SERVER_FAILURE,
  ADD_SERVER_SUCCESS,
  ADD_SERVER_REQUEST,
  CLEAR_SERVER_STATE,
  GET_ALL_SERVER_REQUEST,
  GET_ALL_SERVER_SUCCESS,
  GET_ALL_SERVER_FAILURE,
  DELETE_SERVER_REQUEST,
  DELETE_SERVER_SUCCESS,
  DELETE_SERVER_FAILURE,
  DELETE_DIALOG_STATE,
  SELECT_DELETE_REQUEST,
} from "./actionTypes";
import {
  AddServerAction,
  AddServerFailure,
  AddServerRequest,
  AddServerRequestFailed,
  AddServerRequestPayload,
  AddServerRequestResponse,
  AddServerSuccess,
  ChangeAlertDialogState,
  ClearServerState,
  DeleteRequestResponse,
  DeleteServerAction,
  DeleteServerFailure,
  DeleteServerRequest,
  DeleteServerSuccess,
  GetAllServerAction,
  GetAllServerFailure,
  GetAllServerRequest,
  GetAllServerSuccess,
  SelectDeleteRequest,
  Server,
  ServerList,
} from "./types";

// Send request
export const addServerRequest = (
  payload: AddServerRequestPayload
): AddServerRequest => ({
  type: ADD_SERVER_REQUEST,
  payload,
});

export const addServerSuccess = (
  payload: AddServerRequestResponse
): AddServerSuccess => ({
  type: ADD_SERVER_SUCCESS,
  payload,
});

export const addServerFailure = (
  payload: AddServerRequestFailed
): AddServerFailure => ({
  type: ADD_SERVER_FAILURE,
  payload,
});

export const clearServerState = (): ClearServerState => ({
  type: CLEAR_SERVER_STATE,
});

export const addServerAction = (
  payload: AddServerRequestPayload
): AddServerAction => ({
  type: "@app/API_CALL",
  method: "POST",
  path: "/server",
  payload,
  onRequest: addServerRequest,
  onSuccess: addServerSuccess,
  onFailure: addServerFailure,
});

// Get All request
export const getAllServerRequest = (
  params: PaginationPayload
): GetAllServerRequest => ({
  type: GET_ALL_SERVER_REQUEST,
  params,
});

export const getAllServerSuccess = (
  payload: ServerList
): GetAllServerSuccess => ({
  type: GET_ALL_SERVER_SUCCESS,
  payload,
});

export const getAllServerFailure = (
  payload: AddServerRequestFailed
): GetAllServerFailure => ({
  type: GET_ALL_SERVER_FAILURE,
  payload,
});

export const getAllServerAction = (
  params: PaginationPayload
): GetAllServerAction => ({
  type: "@app/API_CALL",
  method: "GET",
  path: "/server",
  params,
  onRequest: getAllServerRequest,
  onSuccess: getAllServerSuccess,
  onFailure: getAllServerFailure,
});

export const deleteServerRequest = (): DeleteServerRequest => ({
  type: DELETE_SERVER_REQUEST,
});

export const deleteServerSuccess = (
  payload: DeleteRequestResponse
): DeleteServerSuccess => ({
  type: DELETE_SERVER_SUCCESS,
  payload,
});

export const deleteServerFailure = (
  payload: AddServerRequestFailed
): DeleteServerFailure => ({
  type: DELETE_SERVER_FAILURE,
  payload,
});

export const deleteServerAction = (payload: string): DeleteServerAction => ({
  type: "@app/API_CALL",
  method: "DELETE",
  path: `/server/${payload}`,
  onRequest: deleteServerRequest,
  onSuccess: deleteServerSuccess,
  onFailure: deleteServerFailure,
});

export const changeAlertDialogState = (
  payload: boolean
): ChangeAlertDialogState => ({
  type: DELETE_DIALOG_STATE,
  payload,
});

export const selectDeleteRequest = (payload?: Server): SelectDeleteRequest => ({
  type: SELECT_DELETE_REQUEST,
  payload,
});
