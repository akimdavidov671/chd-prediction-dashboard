import { postJson } from "./client";
import type {
  CurrentHeartDiseasePredictionResponse,
  CurrentHeartDiseaseRequest,
} from "../types/uci";

export function predictCurrentHeartDisease(payload: CurrentHeartDiseaseRequest) {
  return postJson<
    CurrentHeartDiseasePredictionResponse,
    CurrentHeartDiseaseRequest
  >("/api/v1/current-heart-disease-screening/predict", payload);
}
