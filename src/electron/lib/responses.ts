export interface IResponses<T> {
  code: 200 | 201 | 204 | 400 | 401 | 403 | 404 | 422 | 500;
  status_code: 200 | 201 | 204 | 400 | 401 | 403 | 404 | 422 | 500;
  status: boolean;
  message: string;
  data?: null | T;
  detail_message?: null | string;
}

const RESPONSES = {
  200: {
    status_code: 200,
    status: true,
    message: "Request Success.",
    data: null,
  },
  201: {
    status_code: 201,
    status: true,
    message: "Request Created.",
  },
  204: {
    status_code: 204,
    status: true,
    message: "Request Deleted.",
  },
  400: {
    status_code: 400,
    status: false,
    message: "Validation Failed.",
    detail_message: null,
    data: null,
  },
  401: {
    status_code: 401,
    status: false,
    message: "Unauthorized Request.",
    detail_message: null,
    data: null,
  },
  403: {
    status_code: 403,
    status: false,
    message: "Forbidden Request.",
    detail_message: null,
    data: null,
  },
  404: {
    status_code: 404,
    status: false,
    message: "Resource Not Found.",
    detail_message: null,
    data: null,
  },
  422: {
    status_code: 422,
    status: false,
    message: "Unprocessable Entity.",
    detail_message: null,
    data: null,
  },
  500: {
    status_code: 500,
    status: false,
    message: "Internal Server Error.",
    detail_message: null,
    data: null,
  },
} as const;

export default function Responses<T>({
  code = 200,
  data = null,
  detail_message = null,
}: Pick<IResponses<T>, "code" | "data" | "detail_message">): IResponses<T> {
  return {
    code,
    ...RESPONSES[code],
    data,
    detail_message,
  };
}
