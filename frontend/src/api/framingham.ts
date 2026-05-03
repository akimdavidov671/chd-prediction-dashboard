import { postJson } from "./client";
import type {
  FraminghamPredictionResponse,
  FraminghamRequest,
} from "../types/framingham";

export function predictFramingham(payload: FraminghamRequest) {
  return postJson<FraminghamPredictionResponse, FraminghamRequest>(
    "/api/v1/framingham/predict",
    payload,
  );
}
