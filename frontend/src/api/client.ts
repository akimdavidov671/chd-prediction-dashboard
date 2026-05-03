export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type ApiErrorDetail =
  | string
  | Array<{
      loc?: Array<string | number>;
      msg?: string;
      type?: string;
    }>
  | unknown;

export class ApiError extends Error {
  status: number;
  detail: ApiErrorDetail;

  constructor(message: string, status: number, detail: ApiErrorDetail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function makeErrorMessage(status: number, detail: ApiErrorDetail): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String(item.msg);
        }

        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  return `Request failed with status ${status}`;
}

export async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new ApiError(
      `Could not connect to the backend server. Make sure FastAPI is running at ${API_BASE_URL}.`,
      0,
      error,
    );
  }

  if (!response.ok) {
    let detail: ApiErrorDetail = null;

    try {
      const errorBody = await response.json();
      detail = errorBody.detail ?? errorBody;
    } catch {
      detail = await response.text();
    }

    throw new ApiError(
      makeErrorMessage(response.status, detail),
      response.status,
      detail,
    );
  }

  return response.json() as Promise<TResponse>;
}
