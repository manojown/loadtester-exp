// Get Loadster data

import { PaginationPayload } from "../../types";
import {
  COMMON_FAILURE,
  COMMON_REQUEST,
  CREATE_EC2_SUCCESS,
  DELETE_EC2_SUCCESS,
  GET_EC2_SERVERS_FAILURE,
  GET_EC2_SERVERS_REQUEST,
  GET_EC2_SERVERS_SUCCESS,
  SELECT_DELETE_EC2,
  TOGGLE_CREATE_EC2_FORM,
} from "./actionTypes";
import {
  AWSEC2,
  CommonFailure,
  CommonRequest,
  CreateEC2Action,
  CreateEC2Success,
  DeleteEC2Action,
  DeleteEC2Payload,
  DeleteEC2Success,
  EC2CreatePayload,
  EC2ListPayload,
  GetEC2ServerAction,
  GetEC2ServerFailure,
  GetEC2ServerRequest,
  GetEC2ServerSuccess,
  SelectDeleteEC2,
  ToggleEC2Form,
} from "./types";

// Common request
export const commonRequest = (): CommonRequest => ({
  type: COMMON_REQUEST,
});

export const commonFailure = (payload: EC2ListPayload): CommonFailure => ({
  type: COMMON_FAILURE,
  payload,
});

// Send request
export const getEC2ServerRequest = (
  params: PaginationPayload
): GetEC2ServerRequest => ({
  type: GET_EC2_SERVERS_REQUEST,
  params,
});

export const agetEC2ServerSuccess = (
  payload: EC2ListPayload
): GetEC2ServerSuccess => ({
  type: GET_EC2_SERVERS_SUCCESS,
  payload,
});

export const getEC2ServerFailure = (
  payload: EC2ListPayload
): GetEC2ServerFailure => ({
  type: GET_EC2_SERVERS_FAILURE,
  payload,
});

export const getEC2ServerAction = (
  params: PaginationPayload
): GetEC2ServerAction => ({
  type: "@app/API_CALL",
  method: "GET",
  path: "/aws/ec2",
  params,
  onRequest: getEC2ServerRequest,
  onSuccess: agetEC2ServerSuccess,
  onFailure: getEC2ServerFailure,
});

// to Create EC2

export const toggleEC2Form = (payload: boolean): ToggleEC2Form => ({
  type: TOGGLE_CREATE_EC2_FORM,
  payload,
});

export const createEC2Success = (
  payload: EC2ListPayload
): CreateEC2Success => ({
  type: CREATE_EC2_SUCCESS,
  payload,
});

export const createEC2Action = (
  payload: EC2CreatePayload
): CreateEC2Action => ({
  type: "@app/API_CALL",
  method: "POST",
  path: "/aws/ec2",
  payload,
  onRequest: commonRequest,
  onSuccess: createEC2Success,
  onFailure: commonFailure,
});

// Delete EC2

export const selectDeleteEC2 = (payload?: AWSEC2): SelectDeleteEC2 => ({
  type: SELECT_DELETE_EC2,
  payload,
});

export const deleteEC2Success = (
  payload: EC2ListPayload
): DeleteEC2Success => ({
  type: DELETE_EC2_SUCCESS,
  payload,
});

export const deleteEC2Action = (
  payload: DeleteEC2Payload
): DeleteEC2Action => ({
  type: "@app/API_CALL",
  method: "DELETE",
  path: "/aws/ec2",
  payload,
  onRequest: commonRequest,
  onSuccess: deleteEC2Success,
  onFailure: commonFailure,
});
