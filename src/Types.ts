type InterceptorFunction<T> = (value: T) => Promise<T> | T;

export interface Interceptor {
    request?: InterceptorFunction<Request | Response>;
    requestError?: InterceptorFunction<unknown>;
    response?: InterceptorFunction<Request | Response>;
    responseError?: InterceptorFunction<unknown>;
}

export interface FetchInterceptorOptions extends Interceptor { }