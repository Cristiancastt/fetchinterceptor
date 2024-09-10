import 'whatwg-fetch';
import {Interceptor} from './Types';

interface FetchInterceptorOptions extends Interceptor { }

class FetchInterceptor {

    private static originalFetch: typeof fetch = (typeof window !== 'undefined' && window.fetch) ||
        (typeof global !== 'undefined' && (global as any).fetch) ||
        fetch;
    private interceptors: Interceptor[] = [];

    constructor(options?: FetchInterceptorOptions) {
        if (options) {
            this.use(options);
        }
        this.init();
    }

    private init(): void {
        if (typeof window !== 'undefined') {
            window.fetch = this.interceptedFetch.bind(this);
        } else if (typeof global !== 'undefined') {
            (global as any).fetch = this.interceptedFetch.bind(this);
        }
    }

    public use(interceptor: Interceptor): () => void {
        this.interceptors.push(interceptor);
        return () => {
            const index = this.interceptors.indexOf(interceptor);
            if (index >= 0) {
                this.interceptors.splice(index, 1);
            }
        };
    }

    public clear(): void {
        this.interceptors = [];
    }

    public restore(): void {
        if (typeof window !== 'undefined') {
            window.fetch = FetchInterceptor.originalFetch;
        } else if (typeof global !== 'undefined') {
            (global as any).fetch = FetchInterceptor.originalFetch;
        }
    }

    private async interceptedFetch(...args: Parameters<typeof fetch>): Promise<Response> {
        let request: Request;
        try {
            request = new Request(...args);
        } catch (error) {
            console.error('Error creating Request:', error);
            throw error;
        }

        let promise: Promise<Request | Response | unknown> = Promise.resolve(request);

        // Request interceptors
        for (const interceptor of this.interceptors) {
            if (interceptor.request) {
                promise = promise.then((value: unknown) => interceptor.request ? interceptor.request(value as Request | Response) : value);
            }
        }

        // Fetch call
        promise = promise.then((modifiedRequest) => {
            return FetchInterceptor.originalFetch(modifiedRequest as Request)
                .then((response) => {
                    const enhancedResponse = response.clone();
                    (enhancedResponse as any).request = modifiedRequest;
                    return enhancedResponse;
                })
                .catch((error) => {
                    (error as any).request = modifiedRequest;
                    return Promise.reject(error);
                });
        });

        // Response interceptors
        for (const interceptor of this.interceptors) {
            if (interceptor.response) {
                promise = promise.then((value: unknown) => interceptor.response ? interceptor.response(value as Request | Response) : value);
            }
            if (interceptor.responseError) {
                promise = promise.catch(interceptor.responseError);
            }
        }

        return promise as Promise<Response>;
    }

}
export default FetchInterceptor;