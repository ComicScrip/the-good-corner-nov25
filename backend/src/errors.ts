import { GraphQLError } from "graphql";

export class UnauthenticatedError extends GraphQLError {
  constructor(params?: { message?: string }) {
    super(
      params?.message ||
        "You need to be authenticated to perform this operation",
      {
        extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
      },
    );
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(params?: { message?: string }) {
    super(params?.message || "You are not allowed to perform this operation", {
      extensions: { code: "FORBIDDEN", http: { status: 403 } },
    });
  }
}
